"""
Pre-flight checklist before you start the Supabase setup.
Run this to ensure all files are in place.
"""
import os
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ MISSING: {description}")
        print(f"   Expected at: {filepath}")
        return False

def check_files():
    """Check all required files exist"""
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    
    print("\n" + "="*60)
    print("🔍 PRE-FLIGHT CHECKLIST")
    print("="*60 + "\n")
    
    checks = [
        (backend_dir / "storage_backends.py", "Supabase storage backend"),
        (backend_dir / "backend" / "settings.py", "Django settings"),
        (backend_dir / ".env", "Environment variables"),
        (backend_dir / "test_supabase.py", "Supabase test script"),
        (project_root / "QUICKSTART.md", "Quick start guide"),
        (project_root / "SUPABASE_SETUP.md", "Detailed setup guide"),
    ]
    
    results = [check_file_exists(filepath, desc) for filepath, desc in checks]
    
    print("\n" + "="*60)
    if all(results):
        print("✅ ALL FILES PRESENT!")
        print("\nYou're ready to start! Follow these steps:")
        print("\n1. Read QUICKSTART.md (in project root)")
        print("2. Go to https://supabase.com and create account")
        print("3. Create project and bucket")
        print("4. Update backend/.env with your credentials")
        print("5. Run: python test_supabase.py")
    else:
        print("❌ SOME FILES ARE MISSING")
        print("\nPlease ask for help to regenerate missing files.")
    print("="*60 + "\n")

if __name__ == "__main__":
    check_files()
