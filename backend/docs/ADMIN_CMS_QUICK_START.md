# Quick Reference: Admin CMS Managers

## 🎯 Manager URLs

Access these URLs after starting the admin app:

### Core Platform

- **Pages**: <http://localhost:5173/admin/pages>
- **SEO & Meta**: <http://localhost:5173/admin/seo>
- **Navigation Menus**: <http://localhost:5173/admin/menus>
- **Footer**: <http://localhost:5173/admin/footer>

### Content & Media

- **Media Library**: <http://localhost:5173/admin/media>
- **Homepage Categories**: <http://localhost:5173/admin/categories>
- **Heroes & Banners**: <http://localhost:5173/admin/heroes>
- **Email Templates**: <http://localhost:5173/admin/email-templates>

### Products & Services

- **Products**: <http://localhost:5173/admin/products>
- **Tours**: <http://localhost:5173/admin/tours>
- **Flights**: <http://localhost:5173/admin/flights>
- **Land Activities**: <http://localhost:5173/admin/land-activities>
- **Sea Activities**: <http://localhost:5173/admin/sea-activities>

### Sales & Marketing

- **Bookings**: <http://localhost:5173/admin/bookings>
- **Promotions**: <http://localhost:5173/admin/promotions>
- **Newsletters**: <http://localhost:5173/admin/newsletters>

### Community & Trust

- **Testimonials**: <http://localhost:5173/admin/testimonials>
- **Reviews**: <http://localhost:5173/admin/reviews>
- **Team**: <http://localhost:5173/admin/team>

### System

- **Audit Logs**: <http://localhost:5173/admin/audit-logs>

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
- [ ] ActivityManagers (Land/Sea) - Add a test activity
- [ ] ProductManager / TourManager - Test catalog entries
- [ ] BookingManager - Review a test booking
- [ ] ReviewModerator - Approve or delete a test review

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
