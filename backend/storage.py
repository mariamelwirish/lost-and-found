import requests
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.conf import settings
import os

class VercelBlobStorage(Storage):
    def __init__(self):
        self.token = os.getenv('BLOB_READ_WRITE_TOKEN')
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN environment variable is required")

    def _save(self, name, content):
        url = f"https://blob.vercel-storage.com/{name}"
        headers = {
            'authorization': f'Bearer {self.token}',
            'x-content-type': getattr(content, 'content_type', 'application/octet-stream')
        }
        
        response = requests.put(url, data=content.read(), headers=headers)
        if response.status_code == 200:
            return name
        raise Exception(f"Failed to upload to Vercel Blob: {response.text}")

    def _open(self, name, mode='rb'):
        url = f"https://blob.vercel-storage.com/{name}"
        response = requests.get(url)
        if response.status_code == 200:
            return ContentFile(response.content)
        raise FileNotFoundError(f"File {name} not found")

    def delete(self, name):
        url = f"https://blob.vercel-storage.com/{name}"
        headers = {'authorization': f'Bearer {self.token}'}
        requests.delete(url, headers=headers)

    def exists(self, name):
        url = f"https://blob.vercel-storage.com/{name}"
        response = requests.head(url)
        return response.status_code == 200

    def url(self, name):
        return f"https://blob.vercel-storage.com/{name}"

    def size(self, name):
        url = f"https://blob.vercel-storage.com/{name}"
        response = requests.head(url)
        return int(response.headers.get('content-length', 0))
