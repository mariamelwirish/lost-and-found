"""
Create Supabase bucket via API
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
import requests
import json

print("\n" + "="*60)
print("🪣 CREATE SUPABASE BUCKET")
print("="*60 + "\n")

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY
bucket_name = settings.SUPABASE_BUCKET_NAME

print(f"Project URL: {supabase_url}")
print(f"Bucket Name: {bucket_name}")
print(f"API Key: {supabase_key[:30]}...\n")

# Create bucket
create_url = f"{supabase_url}/storage/v1/bucket"
headers = {
    'Authorization': f'Bearer {supabase_key}',
    'apikey': supabase_key,
    'Content-Type': 'application/json',
}

payload = {
    "id": bucket_name,
    "name": bucket_name,
    "public": True,
    "file_size_limit": 5242880,  # 5MB
    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"]
}

print("📤 Attempting to create bucket...")
print(f"   Payload: {json.dumps(payload, indent=2)}\n")

response = requests.post(create_url, headers=headers, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}\n")

if response.status_code == 200:
    print("✅ SUCCESS! Bucket created successfully!")
    print(f"\n📦 Bucket '{bucket_name}' is now ready to use.")
    print("\nNext steps:")
    print("1. Run: python test_supabase.py")
    print("2. Start your Django server: python manage.py runserver")
    print("3. Try uploading an image!")
elif response.status_code == 409:
    print("⚠️  Bucket already exists!")
    print("\nThis is actually good - the bucket is already there.")
    print("The test script might not be finding it due to permissions.")
    print("\n💡 Solution: Try uploading an image through your app anyway!")
    print("   It should work even if the test says bucket not found.")
elif "service_role" in response.text.lower() or "Forbidden" in response.text:
    print("❌ Permission Error!")
    print("\n⚠️  The anon key doesn't have permission to CREATE buckets.")
    print("\n📝 YOU MUST CREATE THE BUCKET MANUALLY:")
    print("\n1. Go to: https://sqemiitwfqehocklavbk.supabase.co/project/_/storage/buckets")
    print("2. Click 'New bucket' button")
    print("3. Name: item-images")
    print("4. ☑️  Check 'Public bucket'")
    print("5. File size limit: 5")
    print("6. Click 'Create bucket'")
    print("\nThen your app will be able to upload to it!")
else:
    print("❌ Failed to create bucket")
    print(f"\nError: {response.text}")
    print("\n📝 MANUAL CREATION REQUIRED:")
    print("1. Go to: https://sqemiitwfqehocklavbk.supabase.co/project/_/storage/buckets")
    print("2. Click 'New bucket'")
    print("3. Name: item-images")
    print("4. ☑️  Check 'Public bucket'")
    print("5. Click 'Create bucket'")

print("\n" + "="*60 + "\n")
