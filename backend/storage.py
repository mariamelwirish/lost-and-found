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
        # Ensure the stored path matches our key by disabling the random suffix.
        headers = {
            "Authorization": f"Bearer {self.token}",
            "x-vercel-blob-add-random-suffix": "false",
        }
        resp = requests.put(
            f"https://blob.vercel-storage.com/{key}",
            headers=headers,
            data=data,
            timeout=60,
        )
        resp.raise_for_status()

        # Some deployments may still return the final Blob location in headers.
        # If present and it differs (e.g., service added a suffix), use that path.
        loc = resp.headers.get("Location") or resp.headers.get("location")
        if loc:
            # Expected forms:
            #  - https://abcedef.public.blob.vercel-storage.com/<pathname>
            #  - https://blob.vercel-storage.com/<pathname>
            try:
                from urllib.parse import urlparse

                parsed = urlparse(loc)
                if parsed.path and parsed.path != "/":
                    # Drop leading slash for Django's storage name
                    pathname = parsed.path.lstrip("/")
                    if pathname and pathname != key:
                        return pathname
            except Exception:
                pass

        return key

    def url(self, name):
        name = (name or "").lstrip("/")
        return f"{self.public_base}/{name}"

    def exists(self, name): return False
