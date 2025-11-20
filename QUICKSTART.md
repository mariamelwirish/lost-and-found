# 🎯 QUICK START - Supabase Setup (Read This First!)

## ⚡ What I Did For You

I've already implemented everything! Here's what's ready:

### ✅ Code Changes (Already Done)
1. ✅ Created `storage_backends.py` - Custom Supabase storage handler
2. ✅ Updated `settings.py` - Added Supabase configuration
3. ✅ Updated `.env` - Added Supabase variables (need YOUR credentials)
4. ✅ Updated `.env.example` - For documentation
5. ✅ Created `test_supabase.py` - Test script to verify setup
6. ✅ Disabled other storage (Cloudinary, Backblaze)

### 📋 What YOU Need To Do (30 Minutes Total)

## Step 1️⃣: Get Supabase Credentials (10 min)

1. **Go to https://supabase.com** and sign up (free)
2. **Create new project**:
   - Name: `aub-lost-found`
   - Region: `Europe (Ireland)` or `US East`
   - Plan: **FREE**
3. **Get credentials** from Settings → API:
   - Copy `Project URL`
   - Copy `anon public` key

## Step 2️⃣: Create Storage Bucket (5 min)

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Settings:
   - Name: `item-images`
   - ✅ **CHECK "Public bucket"** ← IMPORTANT!
4. Click **Create bucket**

## Step 3️⃣: Update Your .env File (2 min)

Open `backend/.env` and replace these lines:

```env
USE_SUPABASE=1
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_KEY=eyJhbGc...YOUR-ACTUAL-KEY...
SUPABASE_BUCKET_NAME=item-images
```

**Make sure these are 0:**
```env
USE_CLOUDINARY=0
USE_VERCEL_BLOB=0
```

## Step 4️⃣: Test Locally (5 min)

```bash
# In backend folder
cd backend
python test_supabase.py
```

If all tests pass ✅, then:

```bash
# Terminal 1: Start backend
python manage.py runserver

# Terminal 2: Start frontend
cd ../frontend
npm run dev
```

Go to http://localhost:5173 and try uploading an image!

## Step 5️⃣: Deploy to Render (5 min)

1. **Add to Render Environment Variables**:
   ```
   USE_SUPABASE=1
   SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   SUPABASE_KEY=eyJhbGc...YOUR-KEY...
   SUPABASE_BUCKET_NAME=item-images
   USE_CLOUDINARY=0
   USE_VERCEL_BLOB=0
   ```

2. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Supabase storage"
   git push
   ```

3. **Wait for Render to redeploy** (~3 min)

4. **Test your live site!**

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not uploading | Make bucket PUBLIC in Supabase |
| `test_supabase.py` fails | Check credentials in `.env` |
| Images return 404 | Verify bucket policies allow public read |
| Import error | Make sure `storage_backends.py` is in `backend/` folder |

---

## 📖 Need More Details?

See **SUPABASE_SETUP.md** for complete step-by-step guide with screenshots.

---

## ✨ Benefits You Get

- ✅ **FREE**: 1GB storage, 2GB bandwidth/month
- ✅ **Persistent**: Images survive Render redeploys
- ✅ **Fast**: Built-in CDN
- ✅ **Works in Lebanon**: No VPN needed
- ✅ **No payment**: No credit card required

**Time to complete: ~30 minutes total**
