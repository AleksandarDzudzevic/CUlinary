# Environment Setup Guide

## 🔐 Setting up Environment Variables

### Step 1: Create .env file

Create a file named `.env` in the root directory of your project (same level as `package.json`):

```bash
# In your terminal, create the .env file:
touch .env
```

### Step 2: Add Supabase Credentials

Open the `.env` file and add your Supabase credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**

- Use `EXPO_PUBLIC_` prefix for variables that need to be accessible in the app
- Replace `your-project-id` with your actual Supabase project ID
- Replace the anon key with your actual key from Supabase dashboard

### Step 3: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → Use as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Set up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables and policies

### Step 5: Test the Setup

1. Start your Expo development server:

   ```bash
   npm start
   ```

2. Open the app with Expo Go

3. Try to sign up with a Cornell email (@cornell.edu)

4. If successful, check your Supabase dashboard:
   - Go to **Authentication** → **Users** to see the new user
   - Go to **Table Editor** to see if menu data gets populated

## 🔒 Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file should be in your `.gitignore`
- Use different credentials for development and production

## 🐛 Troubleshooting

### "Supabase credentials not configured" warning

- Check that your `.env` file exists in the root directory
- Verify the variable names start with `EXPO_PUBLIC_`
- Restart your Expo development server after creating/editing `.env`

### "relation does not exist" error

- Run the SQL schema in your Supabase dashboard
- Check that tables were created successfully in Table Editor

### Cornell API not working

- The Cornell Dining API should work without any setup
- If it fails, check your internet connection
- The API URL is: https://now.dining.cornell.edu/api/1.0/dining/eateries.json
