"""Supabase storage backend.

All media files (e.g. item images) are stored in a single
Supabase Storage bucket configured via settings:

- ``SUPABASE_URL``: project URL (https://....supabase.co)
- ``SUPABASE_KEY``: anon public key (used server-side here)
- ``SUPABASE_BUCKET_NAME``: bucket name (e.g. "item-images")

This backend always writes to Supabase and returns public URLs.
There is no support for local filesystem, Cloudinary, or Vercel Blob.
"""
import os
import uuid
import requests
from django.core.files.storage import Storage
from django.conf import settings
from django.core.files.base import ContentFile
from urllib.parse import urljoin


class SupabaseStorage(Storage):
    """
    Custom storage backend for Supabase Storage.
    Stores files in a Supabase bucket and returns public URLs.
    """
    
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
        
        # Construct API endpoints once
        self.storage_url = f"{self.supabase_url}/storage/v1"
        self.bucket_url = f"{self.storage_url}/object/{self.bucket_name}"
        
        # Headers for API requests
        self.headers = {
            'Authorization': f'Bearer {self.supabase_key}',
            'apikey': self.supabase_key,
        }
    
    def _save(self, name, content):
        """
        Save file to Supabase Storage.
        Returns the name/path of the saved file.
        """
        # Generate unique filename to avoid conflicts
        ext = os.path.splitext(name)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = f"item_images/{unique_name}"
        
        # Read file content
        content.seek(0)
        file_data = content.read()
        
        # Upload to Supabase
        upload_url = f"{self.bucket_url}/{file_path}"
        upload_headers = {
            **self.headers,
            'Content-Type': content.content_type if hasattr(content, 'content_type') else 'application/octet-stream',
        }
        
        response = requests.post(
            upload_url,
            data=file_data,
            headers=upload_headers
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to upload to Supabase: {response.text}")
        
        return file_path
    
    def _open(self, name, mode='rb'):
        """
        Retrieve file from Supabase Storage.
        """
        url = self.url(name)
        response = requests.get(url)
        
        if response.status_code == 200:
            return ContentFile(response.content)
        else:
            raise FileNotFoundError(f"File not found: {name}")
    
    def delete(self, name):
        """
        Delete file from Supabase Storage.
        """
        delete_url = f"{self.bucket_url}/{name}"
        response = requests.delete(delete_url, headers=self.headers)
        
        if response.status_code not in [200, 204]:
            # Don't raise error if file doesn't exist
            if response.status_code != 404:
                print(f"Warning: Failed to delete {name}: {response.text}")
    
    def exists(self, name):
        """
        Check if file exists in Supabase Storage.
        """
        try:
            url = self.url(name)
            response = requests.head(url)
            return response.status_code == 200
        except:
            return False
    
    def url(self, name):
        """
        Return public URL for the file.
        """
        # Supabase public URL format
        public_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{name}"
        return public_url
    
    def size(self, name):
        """
        Return file size.
        """
        try:
            url = self.url(name)
            response = requests.head(url)
            return int(response.headers.get('Content-Length', 0))
        except:
            return 0
    
    def get_available_name(self, name, max_length=None):
        """
        Return a filename that's available.
        We generate unique names, so just return the name.
        """
        return name
