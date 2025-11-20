"""Check which storage backend is active"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings

print("\n" + "="*60)
print("📦 ACTIVE STORAGE BACKEND")
print("="*60 + "\n")

print(f"USE_SUPABASE: {settings.USE_SUPABASE}")
print(f"USE_CLOUDINARY: {settings.USE_CLOUDINARY}")
print(f"USE_VERCEL_BLOB: {settings.USE_VERCEL_BLOB}")
print()
print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
print()

if settings.USE_SUPABASE:
    print("✅ SUPABASE IS ACTIVE!")
    print(f"   URL: {settings.SUPABASE_URL}")
    print(f"   Bucket: {settings.SUPABASE_BUCKET_NAME}")
elif settings.USE_CLOUDINARY:
    print("⚠️  Cloudinary is active (not Supabase)")
elif settings.USE_VERCEL_BLOB:
    print("⚠️  Vercel Blob is active (not Supabase)")
else:
    print("⚠️  LOCAL STORAGE IS ACTIVE")
    print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")
    print(f"   MEDIA_URL: {settings.MEDIA_URL}")

print("\n" + "="*60 + "\n")
