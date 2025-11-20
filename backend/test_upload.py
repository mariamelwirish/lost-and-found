"""
Test actual image upload to Supabase
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.files.base import ContentFile
from storage_backends import SupabaseStorage
import io

print("=" * 60)
print("TESTING ACTUAL UPLOAD TO SUPABASE")
print("=" * 60)

# Create a simple test image (1x1 red pixel PNG)
test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

try:
    storage = SupabaseStorage()
    print(f"\n[1] Storage backend initialized")
    print(f"    Bucket: {storage.bucket_name}")
    print(f"    URL: {storage.supabase_url}")
    
    # Create a test file
    test_file = ContentFile(test_image_data, name='test.png')
    print(f"\n[2] Created test image file")
    
    # Try to save it
    print(f"\n[3] Uploading to Supabase...")
    saved_path = storage.save('test.png', test_file)
    print(f"    [OK] Upload successful!")
    print(f"    Saved path: {saved_path}")
    
    # Get the public URL
    url = storage.url(saved_path)
    print(f"\n[4] Public URL: {url}")
    
    # Try to delete it
    print(f"\n[5] Cleaning up (deleting test file)...")
    storage.delete(saved_path)
    print(f"    [OK] Cleanup successful!")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Supabase storage is working perfectly!")
    print("You can now upload images through your app.")
    print("=" * 60 + "\n")
    
except Exception as e:
    print(f"\n[ERROR] Upload failed: {e}")
    print("\nPossible issues:")
    print("1. Bucket 'item-images' doesn't exist")
    print("2. Bucket is not public")
    print("3. Wrong API key or URL")
    print("=" * 60 + "\n")
