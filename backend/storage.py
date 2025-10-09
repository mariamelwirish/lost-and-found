# backend/storage.py
import os
import uuid
import requests
from django.core.files.storage import Storage

class VercelBlobStorage(Storage):
    """
    Minimal Django storage backend for Vercel Blob.
    - Writes with PUT to https://blob.vercel-storage.com/<key> (Bearer token)
    - Public reads via BLOB_PUBLIC_BASE (e.g., https://<bucket>.public.blob.vercel-storage.com)
    """

    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        self.public_base = (os.getenv("BLOB_PUBLIC_BASE") or "").rstrip("/")
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN is required")
        if not self.public_base:
            raise ValueError("BLOB_PUBLIC_BASE is required")

    def _generate_key(self, name):
        # Preserve extension if possible
        ext = ""
        base = (getattr(name, "name", None) or name or "").strip()
        if "." in base:
            ext = "." + base.split(".")[-1].lower()
        return f"item_images/{uuid.uuid4().hex}{ext}"

    def _save(self, name, content):
        """
        Upload to Vercel Blob using a unique key.
        Returns the key (not a full URL) so Django can build .url via self.url()
        """
        key = self._generate_key(getattr(content, "name", name))
        data = content.read() if hasattr(content, "read") else content

        headers = {"Authorization": f"Bearer {self.token}"}
        # Content-Type header is optional; Vercel infers but you can add it if you like:
        # headers["Content-Type"] = getattr(getattr(content, "file", None), "content_type", "application/octet-stream")

        resp = requests.put(f"https://blob.vercel-storage.com/{key}", headers=headers, data=data, timeout=60)
        resp.raise_for_status()
        return key  # IMPORTANT: return ONLY the key

    def url(self, name):
        # Build a public, browser-loadable URL
        name = (name or "").lstrip("/")
        return f"{self.public_base}/{name}"

    # The methods below are optional but nice to have
    def exists(self, name):  # You can optimistically return False so Django always saves
        return False

    def delete(self, name):
        try:
            name = (name or "").lstrip("/")
            requests.delete(f"https://blob.vercel-storage.com/{name}",
                            headers={"Authorization": f"Bearer {self.token}"},
                            timeout=15)
        except Exception:
            pass  # best effort

    def size(self, name):
        try:
            head = requests.head(self.url(name), timeout=10)
            return int(head.headers.get("content-length", 0))
        except Exception:
            return 0
