"""
Debug script to check Supabase bucket creation issue.
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
print("🔍 DETAILED SUPABASE DEBUG")
print("="*60 + "\n")

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY

# Test 1: Check bucket list with detailed response
print("1️⃣ Testing bucket list API...")
buckets_url = f"{supabase_url}/storage/v1/bucket"
headers = {
    'Authorization': f'Bearer {supabase_key}',
    'apikey': supabase_key,
}

print(f"   URL: {buckets_url}")
print(f"   Headers: Authorization: Bearer {supabase_key[:20]}...")
print(f"            apikey: {supabase_key[:20]}...")

response = requests.get(buckets_url, headers=headers)
print(f"\n   Status Code: {response.status_code}")
print(f"   Response: {response.text}\n")

if response.status_code == 200:
    buckets = response.json()
    print(f"   ✅ API call successful")
    print(f"   📦 Buckets returned: {len(buckets)}")
    if buckets:
        print(f"   Bucket details:")
        for b in buckets:
            print(f"      {json.dumps(b, indent=6)}")
    else:
        print(f"   ⚠️  Response is empty list: {buckets}")
else:
    print(f"   ❌ API call failed")
    print(f"   Error: {response.text}")

# Test 2: Try to check if bucket exists by trying to list objects
print("\n2️⃣ Testing direct bucket access...")
bucket_name = settings.SUPABASE_BUCKET_NAME
list_url = f"{supabase_url}/storage/v1/object/list/{bucket_name}"
print(f"   URL: {list_url}")

response2 = requests.post(list_url, headers=headers, json={"limit": 1, "prefix": ""})
print(f"   Status Code: {response2.status_code}")
print(f"   Response: {response2.text}\n")

if response2.status_code == 200:
    print("   ✅ Bucket exists! (We can list objects in it)")
    print("   🔍 The issue is with the bucket LIST API, not the bucket itself")
    print("\n   💡 SOLUTION: The bucket exists but might not show in the list.")
    print("      This is okay! Your app should still work.")
    print("\n      Try uploading an image through your app now!")
elif response2.status_code == 404:
    print("   ❌ Bucket does NOT exist")
    print("\n   📝 STEPS TO FIX:")
    print("      1. Go to: https://sqemiitwfqehocklavbk.supabase.co/project/_/storage/buckets")
    print("      2. Make sure you see 'item-images' bucket in the list")
    print("      3. If not, create it with 'Public bucket' checked")
elif response2.status_code == 403:
    print("   ❌ Permission denied")
    print("\n   📝 STEPS TO FIX:")
    print("      1. Go to Storage → item-images → Policies")
    print("      2. Make sure bucket is PUBLIC")
    print("      3. Add policy for SELECT (read) access")

print("\n" + "="*60)
print("🔍 DEBUG COMPLETE")
print("="*60 + "\n")
