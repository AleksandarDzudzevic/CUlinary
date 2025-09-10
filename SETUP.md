# CUlinary Setup Guide

Follow these steps to set up and run the CUlinary app locally.

## Quick Start

### 1. Supabase Setup (Required)

1. **Create Supabase Account**

   - Go to [supabase.com](https://supabase.com)
   - Create a new account or sign in
   - Create a new project

2. **Set Up Database**

   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to create all tables and policies

3. **Get API Keys**

   - Go to Settings > API in your Supabase dashboard
   - Copy the "Project URL" and "anon public" key

4. **Configure App**
   - Open `lib/supabase.ts`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key

### 2. Install and Run

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator (requires Xcode)
npm run ios

# Run on Android emulator (requires Android Studio)
npm run android

# Run in web browser
npm run web
```

## Testing the App

### 1. Create Account

- Use any @cornell.edu email address
- Password must be at least 6 characters

### 2. Set Preferences

- Choose your campus location
- Select dietary restrictions if any
- Pick favorite dining halls
- Choose preferred cuisines

### 3. View Recommendations

- The app will fetch Cornell dining menus
- Recommendations are based on your preferences
- Filter by meal type (Breakfast, Lunch, Dinner)

## Troubleshooting

### Common Issues

1. **"Network Error" when signing up**

   - Check if Supabase URL and keys are correct
   - Ensure database schema was created properly

2. **No recommendations showing**

   - Make sure Cornell Dining API is accessible
   - Check if preferences are saved properly
   - Try refreshing the home screen

3. **Build errors**
   - Run `npm install` again
   - Clear Metro cache: `npx react-native start --reset-cache`
   - For iOS: `cd ios && pod install`

### Development Tips

1. **Testing on Device**

   - Install Expo Go app on your phone
   - Scan QR code from terminal

2. **Debugging**
   - Use React Native Debugger
   - Check console logs in terminal
   - Use Flipper for advanced debugging

## Production Deployment

### For App Stores

1. **Configure EAS Build**

   ```bash
   npm install -g @expo/cli
   eas build:configure
   ```

2. **Update app.json**

   - Set proper bundle identifiers
   - Add your EAS project ID

3. **Build and Submit**
   ```bash
   eas build --platform all
   eas submit
   ```

## Database Schema Overview

The app uses three main tables:

1. **user_preferences**: Stores user dietary restrictions, favorite dining halls, etc.
2. **menus**: Caches Cornell dining menu data
3. **auth.users**: Built-in Supabase auth table

All tables have Row Level Security (RLS) enabled for data protection.

## Support

If you encounter issues:

1. Check this setup guide
2. Review the main README.md
3. Check Supabase dashboard for errors
4. Ensure Cornell Dining API is accessible
