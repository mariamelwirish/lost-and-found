"""
Add public access policies to Supabase bucket
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
import requests

print("\n" + "="*60)
print("🔐 FIX BUCKET PERMISSIONS")
print("="*60 + "\n")

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY
bucket_name = settings.SUPABASE_BUCKET_NAME

print(f"Bucket: {bucket_name}")
print(f"Project: {supabase_url}\n")

print("⚠️  The 'row-level security policy' error means:")
print("   - The bucket exists ✅")
print("   - But it doesn't allow uploads ❌")
print()
print("📝 TO FIX THIS - Do ONE of these:\n")

print("=" * 60)
print("OPTION 1: Make Bucket Public (Easiest)")
print("=" * 60)
print(f"1. Go to: {supabase_url}/project/_/storage/buckets")
print(f"2. Find the 'item-images' bucket")
print(f"3. Click the 3 dots (...) next to it")
print(f"4. Click 'Edit'")
print(f"5. ✅ CHECK the 'Public bucket' checkbox")
print(f"6. Click 'Save'\n")

print("=" * 60)
print("OPTION 2: Add Storage Policies (Advanced)")
print("=" * 60)
print(f"1. Go to: {supabase_url}/project/_/storage/policies")
print(f"2. Click 'New Policy'")
print(f"3. Select 'For full customization'")
print(f"4. Add these 3 policies:\n")

print("POLICY 1 - Allow Public Read:")
print("""
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');
""")

print("\nPOLICY 2 - Allow Authenticated Upload:")
print("""
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');
""")

print("\nPOLICY 3 - Allow Authenticated Delete:")
print("""
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images');
""")

print("\n" + "="*60)
print("🎯 RECOMMENDED: Use OPTION 1 (much easier!)")
print("="*60)
print("\nAfter fixing, run: python test_upload.py")
print("\n" + "="*60 + "\n")
