# backend/storage.py
import os
import mimetypes
import uuid
import requests
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.conf import settings


def _ensure_public_base():
    base = os.getenv("BLOB_PUBLIC_BASE", "").rstrip("/")
    if not base:
        raise ValueError("BLOB_PUBLIC_BASE environment variable is required")
    return base


class VercelBlobStorage(Storage):
    """
    Minimal Django storage backend for Vercel Blob.
    - Uploads via PUT to blob.vercel-storage.com/<key> with Bearer token.
    - Public reads via BLOB_PUBLIC_BASE (e.g. https://<bucket>.public.blob.vercel-storage.com).
    """
    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN environment variable is required")
        self.public_base = _ensure_public_base()
        self._upload_base = "https://blob.vercel-storage.com"

    # --- Helpers -------------------------------------------------------------

    def _unique_name(self, name: str) -> str:
        # Avoid overwrites: keep ext, randomize basename
        root, ext = os.path.splitext(name)
        return f"{uuid.uuid4().hex}{ext.lower()}"

    def _content_type_for(self, name: str, file_obj) -> str:
        ct = getattr(file_obj, "content_type", None)
        if not ct:
            ct, _ = mimetypes.guess_type(name)
        return ct or "application/octet-stream"

    # --- Core Django storage methods ----------------------------------------

    def _save(self, name, content):
        # Make filename unique
        name = self._unique_name(name)

        # Ensure pointer at beginning
        try:
            content.seek(0)
        except Exception:
            pass

        data = content.read()
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": self._content_type_for(name, content),
        }
        # Upload to private upload host
        url = f"{self._upload_base}/{name.lstrip('/')}"
        resp = requests.put(url, data=data, headers=headers, timeout=30)

        if resp.status_code in (200, 201):
            # Return just the key/path
            return name
        raise Exception(f"Failed to upload to Vercel Blob ({resp.status_code}): {resp.text[:300]}")

    def _open(self, name, mode="rb"):
        # Read from public base (no token)
        url = f"{self.public_base}/{name.lstrip('/')}"
        resp = requests.get(url, timeout=30)
        if resp.status_code == 200:
            return ContentFile(resp.content)
        raise FileNotFoundError(f"File {name} not found (status {resp.status_code})")

    def delete(self, name):
        # Delete via authenticated DELETE on upload host
        url = f"{self._upload_base}/{name.lstrip('/')}"
        headers = {"Authorization": f"Bearer {self.token}"}
        # Best-effort; ignore errors
        try:
            requests.delete(url, headers=headers, timeout=15)
        except Exception:
            pass

    def exists(self, name):
        # Check on public base
        url = f"{self.public_base}/{name.lstrip('/')}"
        resp = requests.head(url, timeout=10)
        return resp.status_code == 200

    def url(self, name):
        # Public URL used by <img src=...>
        return f"{self.public_base}/{name.lstrip('/')}"

    def size(self, name):
        url = f"{self.public_base}/{name.lstrip('/')}"
        resp = requests.head(url, timeout=10)
        return int(resp.headers.get("content-length", 0))
