"""
Validate Supabase project URL and API key
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
print("🔍 VALIDATE SUPABASE PROJECT")
print("="*60 + "\n")

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY

print(f"Project URL: {supabase_url}")
print(f"API Key: {supabase_key[:30]}...\n")

# Test 1: Check if project URL is reachable
print("1️⃣ Testing project URL...")
try:
    response = requests.get(supabase_url, timeout=5)
    if response.status_code == 200:
        print(f"   ✅ Project URL is valid and reachable")
        print(f"   Status: {response.status_code}")
    elif response.status_code == 404:
        print(f"   ❌ Project NOT FOUND (404)")
        print(f"   Your project may have been deleted or paused")
    else:
        print(f"   ⚠️  Unexpected status: {response.status_code}")
except requests.exceptions.Timeout:
    print(f"   ❌ Connection timeout - project may not exist")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Cannot connect - check your internet or project URL")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Check API health endpoint
print("\n2️⃣ Testing REST API endpoint...")
rest_url = f"{supabase_url}/rest/v1/"
headers = {
    'apikey': supabase_key,
}
try:
    response = requests.get(rest_url, headers=headers, timeout=5)
    if response.status_code in [200, 404]:  # 404 is ok, means API is up but no route
        print(f"   ✅ REST API is responding")
        print(f"   Status: {response.status_code}")
    elif "Project removed" in response.text:
        print(f"   ❌ PROJECT HAS BEEN REMOVED/DELETED")
        print(f"   You need to create a new project")
    elif response.status_code == 401:
        print(f"   ⚠️  API is up but key might be wrong")
    else:
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Check storage API
print("\n3️⃣ Testing Storage API endpoint...")
storage_url = f"{supabase_url}/storage/v1/bucket"
headers = {
    'apikey': supabase_key,
    'Authorization': f'Bearer {supabase_key}'
}
try:
    response = requests.get(storage_url, headers=headers, timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
    
    if response.status_code == 200:
        print(f"   ✅ Storage API is working!")
    elif "Project removed" in response.text:
        print(f"   ❌ PROJECT HAS BEEN REMOVED/DELETED")
    elif "paused" in response.text.lower():
        print(f"   ⚠️  Project might be PAUSED")
    else:
        print(f"   ⚠️  Unexpected response")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("📋 SUMMARY")
print("="*60)
print("\n✅ If all tests passed: Your project is valid and active")
print("❌ If you see 'Project removed': Create a new Supabase project")
print("⚠️  If you see 'paused': Resume your project in Supabase dashboard")
print("\n" + "="*60 + "\n")
