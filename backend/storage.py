# backend/storage.py
import os
import uuid
import requests
from django.core.files.storage import Storage

class VercelBlobStorage(Storage):
    """
    Django storage backend for Vercel Blob.
    - Uploads with PUT to https://blob.vercel-storage.com/<key>
    - Stores the full URL returned by Vercel (includes unique suffix)
    """

    def __init__(self):
        self.token = os.getenv("BLOB_READ_WRITE_TOKEN")
        if not self.token:
            raise ValueError("BLOB_READ_WRITE_TOKEN is required")

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
        Returns the FULL URL from Vercel's response (not just the key).
        """
        key = self._generate_key(getattr(content, "name", name))
        data = content.read() if hasattr(content, "read") else content

        headers = {"Authorization": f"Bearer {self.token}"}
        
        resp = requests.put(
            f"https://blob.vercel-storage.com/{key}", 
            headers=headers, 
            data=data, 
            timeout=60
        )
        resp.raise_for_status()
        
        # Parse the response to get the full URL
        response_data = resp.json()
        full_url = response_data.get("url")
        
        if not full_url:
            raise ValueError("No URL returned from Vercel Blob")
        
        # Return the full URL so Django stores it in the database
        return full_url

    def url(self, name):
        """
        Return the URL for accessing the file.
        Since we're storing full URLs now, just return the name as-is.
        """
        return name

    def exists(self, name):
        # Optimistically return False so Django always saves
        return False

    def delete(self, name):
        """
        Delete a file from Vercel Blob.
        Extract the blob key from the full URL if needed.
        """
        try:
            # If name is a full URL, extract just the path
            if name.startswith("http"):
                # Extract everything after the domain
                parts = name.split("/", 3)
                if len(parts) > 3:
                    blob_key = parts[3]
                else:
                    blob_key = name
            else:
                blob_key = name.lstrip("/")
            
            requests.delete(
                f"https://blob.vercel-storage.com/{blob_key}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=15
            )
        except Exception:
            pass  # best effort

    def size(self, name):
        """Get file size by making a HEAD request."""
        try:
            url = name if name.startswith("http") else self.url(name)
            head = requests.head(url, timeout=10)
            return int(head.headers.get("content-length", 0))
        except Exception:
            return 0