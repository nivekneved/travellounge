# Admin Access Information

## 🔐 Admin Panel Login Credentials

**Admin Panel URL**: <http://localhost:3002/login>

### Default Admin Account

```
Email:    admin@travellounge.mu
Password: admin123
```

---

## 📋 Admin Panel Features

Once logged in, you'll have access to:

### Dashboard

- Real-time booking notifications
- Statistics overview
- Activity logs

### Content Managers

1. **Categories** (`/categories`) - Homepage category grid
2. **Footer** (`/footer`) - Contact info & office locations
3. **Media Library** (`/media`) - File uploads & management
4. **Testimonials** (`/testimonials`) - Customer reviews
5. **Activities** (`/activities`) - Sea & land activities
6. **Hero Slides** (`/hero`) - Homepage hero carousel
7. **Promotions** (`/promotions`) - Special offers
8. **Menus** (`/menus`) - Navigation menus

### Operations

- **Products** (`/products`) - Hotel & tour packages
- **Bookings** (`/bookings`) - Reservation management
- **Reviews** (`/reviews`) - Review moderation
- **Audit Logs** (`/audit`) - System activity tracking

---

## 🔒 Security Notes

- **Change Password**: After first login, update the default password
- **Session**: Tokens expire after 30 days
- **Audit Trail**: All admin actions are logged
- **Encryption**: Passwords are hashed with bcrypt (12 rounds)

---

## 🛠️ Database Tables Created

✅ **admins** - Admin user accounts
✅ **categories** - Homepage categories
✅ **site_settings** - Footer & site settings
✅ **media** - Media library files
✅ **testimonials** - Customer reviews

---

## 📝 Next Steps

1. **Login**: Visit <http://localhost:3002/login>
2. **Change Password**: Update default password in Settings
3. **Create Storage Bucket**: For media uploads
   - Go to Supabase Dashboard → Storage
   - New Bucket → Name: `media`, Public: ✓ Yes
4. **Test Managers**: Add sample content to each manager

---

## ⚠️ Important

- Keep these credentials secure
- Do not commit credentials to version control
- Change the default password immediately after first login
- Consider enabling 2FA for production use

---

**Admin CMS is fully operational!** 🎉
