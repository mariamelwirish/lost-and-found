# backend/storage.py
import os, mimetypes, uuid, requests
from django.core.files.storage import Storage
from django.core.files.base import ContentFile

UPLOAD_URL = "https://api.vercel.com/v2/blob/upload"

class VercelBlobStorage(Storage):
    """
    Django storage using Vercel Blob REST API.
    - Uploads to /v2/blob/upload with Bearer token
    - Public reads from BLOB_PUBLIC_BASE
    """

    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        self.public_base = (os.getenv("BLOB_PUBLIC_BASE") or "").rstrip("/")
        if not self.token:
            raise RuntimeError("BLOB_READ_WRITE_TOKEN is required")
        if not self.public_base:
            raise RuntimeError("BLOB_PUBLIC_BASE is required")

    def _unique_name(self, name: str) -> str:
        # keep subfolder from upload_to (e.g., "item_images/")
        base = os.path.basename(name)
        folder = os.path.dirname(name).strip("/")
        root, ext = os.path.splitext(base)
        new_base = f"{uuid.uuid4().hex}{ext.lower()}"
        return f"{folder}/{new_base}" if folder else new_base

    def _save(self, name, content):
        name = self._unique_name(name)
        try:
            content.seek(0)
        except Exception:
            pass

        data = content.read()
        ctype = getattr(content, "content_type", None) or mimetypes.guess_type(name)[0] or "application/octet-stream"

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": ctype,
            "x-vercel-filename": name,  # tells Vercel the key/path to use
        }
        resp = requests.post(UPLOAD_URL, data=data, headers=headers, timeout=30)
        if resp.status_code not in (200, 201):
            # Raise concise error so DRF shows it in logs
            raise Exception(f"Blob upload failed {resp.status_code}: {resp.text[:200]}")

        body = resp.json()
        key = (body.get("pathname") or body.get("key") or name).lstrip("/")
        return key  # IMPORTANT: return only the key

    def url(self, name):
        return f"{self.public_base}/{name.lstrip('/')}"

    def _open(self, name, mode="rb"):
        r = requests.get(self.url(name), timeout=30)
        if r.status_code == 200:
            return ContentFile(r.content)
        raise FileNotFoundError(name)

    def exists(self, name):
        return requests.head(self.url(name), timeout=10).status_code == 200

    def delete(self, name):
        # optional: implement delete via Vercel API if you need it later
        pass

    def size(self, name):
        r = requests.head(self.url(name), timeout=10)
        return int(r.headers.get("content-length", 0))
