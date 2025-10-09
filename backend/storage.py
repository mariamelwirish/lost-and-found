import os
import uuid
import requests
from django.core.files.storage import Storage
from django.core.files.base import ContentFile

class VercelBlobStorage(Storage):
    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        self.public_base = os.getenv("BLOB_PUBLIC_BASE", "").rstrip("/")
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN is required")
        if not self.public_base:
            raise ValueError("BLOB_PUBLIC_BASE is required")

    def _save(self, name, content):
        # Generate unique filename
        ext = os.path.splitext(name)[1] or ".bin"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        
        # Read content
        if hasattr(content, 'seek'):
            content.seek(0)
        data = content.read()
        
        # Upload using PUT method (simpler than multipart)
        url = f"https://blob.vercel-storage.com/{unique_name}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": getattr(content, 'content_type', 'application/octet-stream')
        }
        
        response = requests.put(url, data=data, headers=headers, timeout=30)
        
        if response.status_code in (200, 201):
            return unique_name
        
        raise Exception(f"Vercel Blob upload failed: {response.status_code} - {response.text}")

    def url(self, name):
        return f"{self.public_base}/{name.lstrip('/')}"

    def exists(self, name):
        try:
            response = requests.head(f"{self.public_base}/{name.lstrip('/')}", timeout=10)
            return response.status_code == 200
        except:
            return False

    def delete(self, name):
        try:
            url = f"https://blob.vercel-storage.com/{name.lstrip('/')}"
            headers = {"Authorization": f"Bearer {self.token}"}
            requests.delete(url, headers=headers, timeout=15)
        except:
            pass  # Best effort

    def size(self, name):
        try:
            response = requests.head(f"{self.public_base}/{name.lstrip('/')}", timeout=10)
            return int(response.headers.get('content-length', 0))
        except:
            return 0
