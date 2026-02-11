# Quick Reference: Admin CMS Managers

## 🎯 Manager URLs

Access these URLs after running the database migration:

- **Categories**: <http://localhost:5173/admin/categories>
- **Footer**: <http://localhost:5173/admin/footer>
- **Media Library**: <http://localhost:5173/admin/media>
- **Testimonials**: <http://localhost:5173/admin/testimonials>
- **Activities**: <http://localhost:5173/admin/activities>

## 📋 Quick Setup Checklist

### 1. Database Setup (Required)

```bash
# Option A: Using Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of: supabase/migrations/admin_cms_schema.sql
3. Paste and click "Run"

# Option B: Using PowerShell Script
.\scripts\setup-admin-cms.ps1
```

### 2. Storage Setup (Required for Media Library)

```bash
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: media
4. Public: ✓ Yes
5. Click "Create"
```

### 3. Test Each Manager

- [ ] CategoryManager - Add a test category
- [ ] FooterManager - Update contact info
- [ ] MediaLibrary - Upload a test image
- [ ] TestimonialManager - Add a test review
- [ ] ActivityManager - Add a test activity

## 🔧 Troubleshooting

**"Table does not exist"**
→ Run the SQL migration in Supabase Dashboard

**"Permission denied"**
→ Check RLS policies, ensure you're logged in as admin

**Images not uploading**
→ Create 'media' bucket in Supabase Storage

**Changes not showing on website**
→ Update front-end components to fetch from database

## 📚 Full Documentation

- Setup Guide: `docs/ADMIN_CMS_SETUP.md`
- Walkthrough: `brain/walkthrough.md`
- Database Schema: `supabase/migrations/admin_cms_schema.sql`
