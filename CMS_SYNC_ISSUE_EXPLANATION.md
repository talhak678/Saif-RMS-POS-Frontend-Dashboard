# 🔍 CMS Website Sync Issue - Root Cause & Solution

## Problem
Changes made in the CMS Dashboard are **NOT** appearing on the website.

## Root Cause
There is a **MISMATCH** between:
1. **What restaurant the Dashboard saves to** (based on logged-in user's `restaurantId`)
2. **What restaurant the Website fetches from** (hardcoded slug `"saifs-kitchen"`)

## How It Works Currently

### Dashboard Save Flow:
```
User logs in → Has restaurantId (from their account)
↓
Makes CMS changes
↓
Clicks "Publish Changes"
↓
Saves to: `/api/cms/config` (saves to USER's restaurantId)
```

### Website Fetch Flow:
```
Website loads
↓
Fetches from: `/api/cms/config/public/saifs-kitchen` (HARDCODED)
↓
Returns: CMS data for restaurant with slug "saifs-kitchen" ONLY
```

### The Problem:
- If your logged-in user belongs to a **different restaurant**, the data is saved there
- But the website **always** fetches from `"saifs-kitchen"`
- Result: **Changes never appear!**

## Solution Options

### Option 1: Ensure User Belongs to "saifs-kitchen" Restaurant ✅ RECOMMENDED
1. Log in with a user that belongs to the restaurant with slug `"saifs-kitchen"`
2. Check your user account to verify `restaurantId` matches the restaurant with slug `"saifs-kitchen"`

**How to verify:**
- Open browser console (F12) in the Dashboard
- After clicking "Publish Changes", check the console logs
- Look for: `✅ CMS Save Response: { ... }`
- Note the `restaurantId` from the saved data

**Seed Data Info:**
- Default restaurant slug: `saifs-kitchen`
- Default admin user: `admin@saifskitchen.com` / `password123`
- This user should have `restaurantId` matching `"saifs-kitchen"`

### Option 2: Make Website Slug Dynamic (Advanced)
Update `AppContext.tsx` to fetch slug from environment variable:

```typescript
// In e:\Saif-RMS-POS-Website\package\package\src\context\AppContext.tsx
// Line 69:
const slug = import.meta.env.VITE_RESTAURANT_SLUG || "saifs-kitchen";
```

Then create `.env` file with:
```
VITE_RESTAURANT_SLUG=your-restaurant-slug
```

### Option 3: Admin Panel Restaurant Switcher (Multi-tenant)
Add a restaurant switcher in the Dashboard to select which restaurant to edit.

## Immediate Action Required

1. **Check which user you're logged in as:**
   - Dashboard → Profile/Settings
   
2. **Verify that user belongs to "saifs-kitchen" restaurant:**
   - Check backend database or seed data
   
3. **If not, log in with the correct user:**
   - Email: `admin@saifskitchen.com`
   - Password: `password123`
   
4. **Try publishing changes again**

## Verification Steps

After logging in with the correct user:

1. Open Dashboard and Browser Console (F12)
2. Make a small change in CMS
3. Click "Publish Changes"
4. Check console for: `✅ CMS Save Response:`
5. Refresh website to see changes

## File Locations

**Website slug configuration:**
- `e:\Saif-RMS-POS-Website\package\package\src\context\AppContext.tsx`
- Line 69: `const slug = "saifs-kitchen";`

**Dashboard save function:**
- `e:\Saif-RMS-POS-Frontend-Dashboard\src\app\(admin)\cms\page.tsx`
- Line 268: `handleSave` function

**Backend API:**
- `/api/cms/config` - Saves to authenticated user's restaurant
- `/api/cms/config/public/[slug]` - Fetches by restaurant slug
