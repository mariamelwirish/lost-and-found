"""
Quick test script to verify Supabase Storage connection.
Run this after setting up your Supabase credentials in .env

Usage:
    python test_supabase.py
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


def test_supabase_connection():
    """Test if Supabase credentials are working"""
    print("\nTesting Supabase Storage Connection...\n")
    
    # Check if Supabase is enabled
    if not getattr(settings, 'USE_SUPABASE', False):
        print("[ERROR] USE_SUPABASE is not enabled in settings")
        print("   Set USE_SUPABASE=1 in your .env file")
        return False
    
    # Check required settings
    try:
        supabase_url = settings.SUPABASE_URL
        supabase_key = settings.SUPABASE_KEY
        bucket_name = settings.SUPABASE_BUCKET_NAME
    except AttributeError as e:
        print(f"[ERROR] Missing Supabase configuration: {e}")
        print("   Check your .env file has SUPABASE_URL, SUPABASE_KEY, and SUPABASE_BUCKET_NAME")
        return False
    
    print(f"[OK] Supabase URL: {supabase_url}")
    print(f"[OK] Bucket Name: {bucket_name}")
    print(f"[OK] API Key: {supabase_key[:20]}... (truncated)")
    
    # Test connection to Supabase
    print("\nTesting connection to Supabase...")
    try:
        # Try to list buckets
        buckets_url = f"{supabase_url}/storage/v1/bucket"
        headers = {
            'Authorization': f'Bearer {supabase_key}',
            'apikey': supabase_key,
        }
        
        response = requests.get(buckets_url, headers=headers)
        
        if response.status_code == 200:
            print("[OK] Successfully connected to Supabase!")
            buckets = response.json()
            print(f"\nFound {len(buckets)} bucket(s):")
            for bucket in buckets:
                bucket_id = bucket.get('id', bucket.get('name', 'unknown'))
                is_public = bucket.get('public', False)
                status = "PUBLIC" if is_public else "PRIVATE"
                print(f"   - {bucket_id} ({status})")
                
                if bucket_id == bucket_name:
                    if is_public:
                        print(f"   [OK] Your '{bucket_name}' bucket is PUBLIC - perfect!")
                    else:
                        print(f"   [WARNING] Your '{bucket_name}' bucket is PRIVATE - make it public!")
            
            # Check if our bucket exists
            bucket_ids = [b.get('id', b.get('name')) for b in buckets]
            if bucket_name not in bucket_ids:
                print(f"\n[WARNING] Bucket '{bucket_name}' not found!")
                print(f"   Please create it in Supabase Dashboard -> Storage")
                return False
            
            return True
        else:
            print(f"[ERROR] Failed to connect: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Connection error: {e}")
        return False


def test_storage_backend():
    """Test if Django storage backend is working"""
    print("\nTesting Django Storage Backend...\n")
    
    try:
        from storage_backends import SupabaseStorage
        
        storage = SupabaseStorage()
        print("[OK] SupabaseStorage backend loaded successfully")
        print(f"[OK] Storage URL: {storage.storage_url}")
        print(f"[OK] Bucket URL: {storage.bucket_url}")
        
        # Check if DEFAULT_FILE_STORAGE is set
        default_storage = getattr(settings, 'DEFAULT_FILE_STORAGE', None)
        if default_storage == 'storage_backends.SupabaseStorage':
            print("[OK] DEFAULT_FILE_STORAGE is correctly configured")
        else:
            print(f"[WARNING] DEFAULT_FILE_STORAGE is: {default_storage}")
            print("   Should be: 'storage_backends.SupabaseStorage'")
        
        return True
    except Exception as e:
        print(f"[ERROR] Storage backend error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("SUPABASE STORAGE TEST")
    print("=" * 60)
    
    test1 = test_supabase_connection()
    test2 = test_storage_backend()
    
    print("\n" + "=" * 60)
    if test1 and test2:
        print("[OK] ALL TESTS PASSED!")
        print("\nYou're ready to use Supabase Storage!")
        print("Try uploading an image through your app now.")
    else:
        print("[ERROR] SOME TESTS FAILED")
        print("\nPlease fix the issues above and run the test again.")
    print("=" * 60 + "\n")
