# Admin CMS Setup Guide

## 🚀 Quick Start

This guide will help you set up the database and configure the admin CMS managers.

---

## 1️⃣ Database Setup

### Run the Migration

1. Navigate to Supabase Dashboard → SQL Editor
2. Open the migration file: `supabase/migrations/admin_cms_schema.sql`
3. Copy and paste the entire SQL content
4. Click "Run" to execute

This will create:

- ✅ `categories` table
- ✅ `site_settings` table
- ✅ `media` table
- ✅ `testimonials` table
- ✅ Indexes for performance
- ✅ RLS policies for security
- ✅ Triggers for auto-updating timestamps

---

## 2️⃣ Supabase Storage Setup

### Create Media Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `media`
4. Public bucket: ✅ Yes
5. Click "Create Bucket"

### Set Bucket Policies

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'authenticated');
```

---

## 3️⃣ Admin Access

### Navigate to Admin Panel

```
http://localhost:5173/admin
```

### New Manager Routes

- `/admin/categories` - Homepage categories
- `/admin/footer` - Footer settings
- `/admin/media` - Media library
- `/admin/testimonials` - Customer testimonials
- `/admin/activities` - Sea/Land activities

---

## 4️⃣ Front-End Integration

### Update CategoryGrid Component

Replace hardcoded categories with database fetch:

```javascript
// In CategoryGrid.jsx
const { data: categories = [] } = useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  }
});
```

### Update Footer Component

Fetch footer settings from database:

```javascript
// In Layout.jsx footer section
const { data: settings = {} } = useQuery({
  queryKey: ['site-settings'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .in('category', ['footer']);
    
    if (error) throw error;
    
    const settingsObj = {};
    data.forEach(s => settingsObj[s.key] = s.value);
    return settingsObj;
  }
});
```

---

## 5️⃣ Testing Checklist

### CategoryManager

- [ ] Create a new category
- [ ] Upload an image
- [ ] Toggle active/inactive status
- [ ] Reorder categories
- [ ] Verify on homepage

### FooterManager

- [ ] Update contact information
- [ ] Add social media links
- [ ] Add office locations
- [ ] Verify on website footer

### MediaLibrary

- [ ] Upload images
- [ ] Create folders
- [ ] Search files
- [ ] Copy URL to clipboard
- [ ] Delete files

### TestimonialManager

- [ ] Add testimonial
- [ ] Set star rating
- [ ] Toggle approval status
- [ ] Mark as featured
- [ ] Verify on homepage

### ActivityManager

- [ ] Add sea activity
- [ ] Add land activity
- [ ] Set pricing
- [ ] Toggle active status
- [ ] Verify on activities page

---

## 6️⃣ Troubleshooting

### "Table does not exist" Error

- Run the SQL migration in Supabase SQL Editor
- Verify tables were created: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

### "Permission denied" Error

- Check RLS policies are enabled
- Ensure user is authenticated
- Verify admin role permissions

### Images Not Uploading

- Check Supabase Storage bucket exists
- Verify bucket policies are set
- Check file size limits (default 50MB)

### Changes Not Reflecting on Website

- Clear browser cache
- Check if front-end is fetching from database
- Verify query invalidation is working

---

## 📚 Additional Resources

- **Implementation Plan**: See `implementation_plan.md` for detailed architecture
- **Walkthrough**: See `walkthrough.md` for feature overview
- **Database Schema**: See `supabase/migrations/admin_cms_schema.sql`

---

## ✅ Success Criteria

Your admin CMS is ready when:

- ✅ All 5 managers are accessible
- ✅ Database tables are created
- ✅ Storage bucket is configured
- ✅ Front-end displays database content
- ✅ Changes in admin reflect on website
- ✅ No console errors

---

**Need Help?** Check the walkthrough document or review the implementation plan for detailed information.
