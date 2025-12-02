# 🔗 Quick Integration Guide

## Step 1: Run Database Migration

Go to your **Supabase Dashboard** → **SQL Editor** and run this file:
```
supabase/migrations/20251202095400_create_declarations_system.sql
```

This creates all 5 tables needed for the declaration system.

## Step 2: Verify Setup

Run this command to check if tables were created:
```bash
node setup_declarations.js
```

You should see 8 life areas listed.

## Step 3: Add to UserDashboard

I'll integrate the new components into your existing dashboard now!

The changes will add:
- "Declarations" tab in navigation
- Practice session modal
- Integration with existing streak system
- Quick practice button on home screen

---

Ready to integrate! 🚀
