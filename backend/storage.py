# backend/storage.py  (use this)
import os, uuid, requests
from django.core.files.storage import Storage

class VercelBlobStorage(Storage):
    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        self.public_base = (os.getenv("BLOB_PUBLIC_BASE") or "").rstrip("/")
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN is required")
        if not self.public_base:
            raise ValueError("BLOB_PUBLIC_BASE is required")

    def _generate_key(self, name):
        ext = ""
        base = (getattr(name, "name", None) or name or "").strip()
        if "." in base:
            ext = "." + base.split(".")[-1].lower()
        return f"item_images/{uuid.uuid4().hex}{ext}"

    def _save(self, name, content):
        key = self._generate_key(getattr(content, "name", name))
        data = content.read() if hasattr(content, "read") else content
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.put(f"https://blob.vercel-storage.com/{key}",
                            headers=headers, data=data, timeout=60)
        resp.raise_for_status()          # <- 200/201, no JSON expected
        return key                       # <-- return ONLY the key

    def url(self, name):
        name = (name or "").lstrip("/")
        return f"{self.public_base}/{name}"

    def exists(self, name): return False
