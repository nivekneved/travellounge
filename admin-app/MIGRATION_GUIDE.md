# WooCommerce to Supabase Migration Guide

This guide explains how to migrate your products from WooCommerce to Supabase using the built-in migration tool.

## Prerequisites

1. Ensure your Supabase database has the `services` table properly configured
2. Generate WooCommerce API credentials
3. Backup your Supabase database before running the migration

## Generating WooCommerce API Credentials

1. In your WordPress admin panel, go to **WooCommerce → Settings → Advanced → REST API**
2. Click "Add Key" to generate a new set of API credentials
3. Make sure to note down both:
   - **Consumer Key** (starts with `ck_`)
   - **Consumer Secret** (starts with `cs_`)
4. Ensure the key has **Read** permissions (or **Read/Write** if you plan to sync in both directions)

## Running the Migration

1. Open your admin app and navigate to the **Data Migration** tool in the sidebar
2. Enter the following information:
   - **Site URL**: Your full WordPress/WooCommerce site URL (e.g., `https://yoursite.com`)
   - **Consumer Key**: The WooCommerce API consumer key
   - **Consumer Secret**: The WooCommerce API consumer secret
3. Click **Start Migration** and wait for the process to complete

## Environment Variables

Alternatively, you can set the WooCommerce credentials as environment variables in a `.env` file:

```bash
VITE_WOOCOMMERCE_SITE_URL=https://yoursite.com
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxx
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxx
```

## What Gets Migrated

The migration process will:

- Import product names, descriptions, and categories
- Map WooCommerce categories to your app's service categories
- Import product images and media
- Transfer pricing information
- Include product attributes as features
- Preserve product status (active/inactive)
- Store WooCommerce product ID for reference

### Category Mapping

WooCommerce product categories are automatically mapped to your app's categories:

- `hotel`, `accommodation`, `rooms`, `stays` → `hotels`
- `activity`, `excursion`, `tour` → `activities`
- `cruise`, `boat` → `cruises`
- `package`, `deal` → `packages`
- `transfer`, `transport` → `transfers`
- `guest-house`, `lodging` → `Guest Houses`

## Post-Migration Steps

1. Verify that products have been imported correctly
2. Update any missing information in the admin app
3. Check product images and replace if necessary
4. Test the frontend to ensure products display properly

## Troubleshooting

- If the migration fails, check that your WooCommerce API credentials are correct
- Verify that your Supabase connection is working
- Check browser console for specific error messages
- Ensure your WooCommerce site is publicly accessible

## Re-running the Migration

The migration process uses upsert operations, meaning it will update existing records or create new ones. Products are identified by name and location to prevent duplicates.

> ⚠️ **Warning**: Always backup your Supabase database before running migrations.