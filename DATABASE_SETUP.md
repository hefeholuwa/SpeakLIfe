# SpeakLife Database Setup Guide

## 🗄️ Database Schema Setup

Follow these steps to set up your SpeakLife database in Supabase:

### **Step 1: Create the Database Schema**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `essential-schema.sql`
4. Click **Run** to create all tables

### **Step 2: Add Sample Data**
1. In the SQL Editor, copy and paste the contents of `sample-data.sql`
2. Click **Run** to populate with sample data
3. This will create topics like Faith, Healing, Victory, Peace, etc.

### **Step 3: Set Up Row Level Security**
1. Copy and paste the contents of `rls-policies.sql`
2. Click **Run** to enable RLS policies
3. This ensures proper security for user data

## 📊 Database Structure

### **Tables Created:**

#### **1. `users` Table**
- `id` - Primary key (UUID)
- `full_name` - User's full name
- `email` - User's email (unique)
- `avatar_url` - Profile picture URL
- `streak_count` - Current confession streak
- `last_confession_date` - Last time user confessed
- `total_confessions` - Total confessions made
- `created_at` - Account creation timestamp

#### **2. `topics` Table**
- `id` - Primary key (UUID)
- `title` - Topic name (Faith, Healing, Victory, etc.)
- `description` - Topic description
- `icon` - Emoji icon for the topic
- `color` - Hex color code
- `created_at` - Creation timestamp

#### **3. `verses` Table**
- `id` - Primary key (UUID)
- `topic_id` - Foreign key to topics table
- `reference` - Bible reference (e.g., "John 3:16")
- `scripture_text` - The actual scripture
- `confession_text` - Personal confession based on scripture
- `version` - Bible version (NIV, ESV, etc.)
- `created_at` - Creation timestamp

#### **4. `user_confessions` Table**
- `id` - Primary key (UUID)
- `user_id` - Foreign key to users table
- `verse_id` - Foreign key to verses table
- `confessed_at` - When user confessed this verse
- `note` - Optional personal note
- `created_at` - Creation timestamp

#### **5. `favorites` Table**
- `id` - Primary key (UUID)
- `user_id` - Foreign key to users table
- `verse_id` - Foreign key to verses table
- `created_at` - When favorited
- Unique constraint on (user_id, verse_id)

## 🔒 Security Features

### **Row Level Security (RLS) Policies:**
- **Users** can only access their own data
- **Public read access** to topics and verses
- **Admin access** for content management
- **Secure user authentication** integration

## 🚀 Next Steps

After setting up the database:

1. **Test the admin panel** - Go to `?admin=true` to see your data
2. **Add more content** - Use the AI content generator in admin panel
3. **Customize topics** - Add your own topics and verses
4. **Set up authentication** - When ready to add user features

## 📁 Files Created:
- `essential-schema.sql` - Core database tables
- `sample-data.sql` - Sample topics and verses
- `rls-policies.sql` - Security policies
- `database-schema.sql` - Complete schema with advanced features

Your SpeakLife database is now ready! 🎉
