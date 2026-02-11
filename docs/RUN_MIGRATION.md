# 🚀 Admin CMS Database Migration - Manual Setup

Since Supabase CLI is not connected to your cloud project, please follow these steps to apply the migration manually:

## Step 1: Open Supabase Dashboard

1. Go to <https://supabase.com/dashboard>
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)

## Step 2: Copy the Migration SQL

The migration file is located at:

```
supabase/migrations/admin_cms_schema.sql
```

**Full path**: `c:\Users\deven\Desktop\Travel Lounge 2026\Dumbo\supabase\migrations\admin_cms_schema.sql`

## Step 3: Run the Migration

1. In SQL Editor, click **"New Query"**
2. Copy the ENTIRE contents of `admin_cms_schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

## Step 4: Verify Tables Created

After running, you should see a verification query result showing:

- `categories` (10 columns)
- `media` (8 columns)
- `site_settings` (5 columns)
- `testimonials` (9 columns)

## Step 5: Create Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Name: `media`
4. **Public bucket**: ✓ Yes
5. Click **"Create Bucket"**

## Step 6: Test Admin Managers

Navigate to your admin panel and test:

- <http://localhost:5173/admin/categories>
- <http://localhost:5173/admin/footer>
- <http://localhost:5173/admin/media>
- <http://localhost:5173/admin/testimonials>
- <http://localhost:5173/admin/activities>

---

## ✅ What the Migration Creates

### Tables

1. **categories** - Homepage category grid
2. **site_settings** - Footer & site-wide settings
3. **media** - Media library files
4. **testimonials** - Customer reviews

### Features

- ✅ Indexes for performance
- ✅ RLS policies for security
- ✅ Auto-update triggers
- ✅ Default footer settings

---

## 🔧 Troubleshooting

**Error: "relation already exists"**
→ Tables already created, you're good to go!

**Error: "permission denied"**
→ Make sure you're logged in as project owner

**Error: "syntax error"**
→ Make sure you copied the ENTIRE SQL file

---

## 📋 Quick Checklist

- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy admin_cms_schema.sql
- [ ] Paste and Run
- [ ] Verify 4 tables created
- [ ] Create 'media' storage bucket
- [ ] Test admin managers

**Need the SQL?** Open: `supabase/migrations/admin_cms_schema.sql`
