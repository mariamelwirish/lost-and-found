# 🚀 Supabase Storage Setup Guide

## Complete Step-by-Step Instructions

### Part 1: Create Supabase Account & Project (5 minutes)

#### Step 1: Sign Up for Supabase
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with:
   - GitHub account (recommended), OR
   - Email address

#### Step 2: Create a New Project
1. After login, click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `aub-lost-found` (or any name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose **Europe (Ireland)** or **US East** (closest with good connectivity)
   - **Pricing Plan**: Select **FREE** (0$/month)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

#### Step 3: Get Your Project Credentials
1. Once project is ready, go to **Settings** (⚙️ icon on left sidebar)
2. Click **"API"** in the Settings menu
3. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string starting with eyJ)
4. **COPY BOTH** - you'll need them!

---

### Part 2: Create Storage Bucket (2 minutes)

#### Step 4: Create a Public Bucket
1. In Supabase dashboard, click **"Storage"** (📦 icon on left sidebar)
2. Click **"New bucket"** button
3. Fill in:
   - **Name**: `item-images`
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: 5 MB (or higher if needed)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg, image/png, image/gif, image/webp`
4. Click **"Create bucket"**

#### Step 5: Verify Bucket Settings
1. Click on your `item-images` bucket
2. Click **"Policies"** tab
3. You should see a policy for **"Public access"**
4. If not, click **"New policy"** → **"For full customization"**
5. Use this policy:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images');
```

**Or simpler**: Just enable "Public read access" in bucket settings.

---

### Part 3: Configure Your Backend (2 minutes)

#### Step 6: Update Your `.env` File
1. Open `backend/.env`
2. Find the Supabase section (already added by me)
3. Replace with YOUR credentials:

```env
USE_SUPABASE=1
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
SUPABASE_BUCKET_NAME=item-images
```

**Important**: 
- Use your **Project URL** (from Step 3)
- Use your **anon public key** (from Step 3)
- Keep `SUPABASE_BUCKET_NAME=item-images` (matches the bucket you created)

#### Step 7: Make Sure Other Storage is Disabled
In the same `.env` file, verify:
```env
USE_CLOUDINARY=0
USE_VERCEL_BLOB=0
USE_SUPABASE=1  ← Should be 1
```

---

### Part 4: Test Locally (3 minutes)

#### Step 8: Test Image Upload
1. Open terminal in `backend` folder
2. Run the development server:
   ```bash
   python manage.py runserver
   ```

3. Open another terminal in `frontend` folder
4. Run the frontend:
   ```bash
   npm run dev
   ```

5. Go to **http://localhost:5173**
6. Login and try to **create a new post with an image**
7. Check if:
   - Upload succeeds
   - Image displays correctly
   - Image URL starts with `https://xxxxx.supabase.co/storage/v1/object/public/item-images/...`

#### Step 9: Verify in Supabase Dashboard
1. Go to your Supabase dashboard
2. Click **Storage** → **item-images** bucket
3. You should see your uploaded images!
4. Click on an image to get its public URL

---

### Part 5: Deploy to Render (5 minutes)

#### Step 10: Add Environment Variables to Render
1. Go to **https://dashboard.render.com**
2. Select your backend service
3. Go to **"Environment"** tab
4. Add these environment variables:

```
USE_SUPABASE=1
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=item-images
```

**Also make sure these are set to 0:**
```
USE_CLOUDINARY=0
USE_VERCEL_BLOB=0
```

#### Step 11: Deploy Changes
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add Supabase storage integration"
   git push
   ```

2. Render will automatically redeploy

3. Wait for deployment to complete (~3-5 minutes)

#### Step 12: Test Production
1. Go to your deployed frontend (Vercel URL)
2. Login
3. Create a post with an image
4. Verify the image displays correctly
5. Check Supabase dashboard - the image should be there!

---

## 🎉 Done! Your Images Are Now Persistent!

### What Changed:
- ✅ Images stored in Supabase cloud (not local Render filesystem)
- ✅ Images persist through redeploys
- ✅ Fast CDN delivery worldwide
- ✅ 1GB free storage
- ✅ Works from Lebanon without VPN

### Monitoring Your Usage:
1. Go to Supabase dashboard
2. Click **"Settings"** → **"Usage"**
3. Check storage usage (you have 1GB free)

### If You Run Out of Space:
- Free tier: 1GB storage
- Delete old/unused images from the bucket
- Or upgrade to Pro plan ($25/month) for 100GB

---

## 🐛 Troubleshooting

### Images not uploading?
1. Check Render logs for errors
2. Verify bucket is **PUBLIC** in Supabase
3. Verify environment variables are correct in Render
4. Check Supabase project isn't paused (free projects pause after inactivity)

### Images returning 404?
1. Check bucket policies allow public access
2. Verify image exists in Supabase Storage dashboard
3. Check the URL format: `https://xxx.supabase.co/storage/v1/object/public/item-images/xxx.jpg`

### Storage backend errors?
1. Make sure `storage_backends.py` is in the `backend` folder
2. Check Python environment has `requests` library (already in requirements.txt)
3. Restart Django server after changing settings

---

## 📞 Need Help?
- Supabase Docs: https://supabase.com/docs/guides/storage
- Supabase Discord: https://discord.supabase.com

**Note**: I've already created all the code. You just need to follow Steps 1-12 above!
