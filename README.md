# CUlinary - Cornell Dining Hall Food Recommender

A React Native mobile app that provides personalized dining recommendations for Cornell University students based on their preferences, dietary restrictions, and campus location.

## Features

- 🔐 **Authentication**: Secure login/signup with Supabase Auth (Cornell email required)
- 👤 **User Preferences**: Customizable dietary restrictions, favorite dining halls, and cuisine preferences
- 🍽️ **Smart Recommendations**: AI-powered recommendations based on user preferences and location
- 📍 **Location-Aware**: Considers campus location for convenient dining suggestions
- 📱 **Real-time Menus**: Fetches daily menus from Cornell Dining API
- 🎨 **Modern UI**: Clean, intuitive interface with Cornell branding

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL commands from `supabase-schema.sql` to create the database tables
4. Get your project URL and anon key from Settings > API

### 2. Database Migration (Important!)

After running the initial schema, you need to run the migration:

1. Go to your Supabase SQL Editor
2. Run the commands from `database-migration.sql` to add new columns
3. This adds campus area, location, and operating hours to the menus table

### 3. Environment Configuration

1. Create a `.env` file in the root directory:

```bash
touch .env
```

2. Add your Supabase credentials to the `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**📖 For detailed setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**

### 4. Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS (requires Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android
```

## Project Structure

```
CUlinary/
├── contexts/           # React contexts (Auth)
├── lib/               # Configuration files (Supabase)
├── navigation/        # Navigation stacks
├── screens/           # App screens
├── services/          # API services (Cornell Dining, Recommendations)
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component
└── supabase-schema.sql # Database schema
```

## Key Components

### Authentication

- Cornell email validation (@cornell.edu required)
- Secure session management with Supabase
- Automatic preference setup for new users

### Recommendation Engine

- Scores dining halls based on:
  - User's dietary restrictions
  - Preferred cuisines
  - Favorite dining halls
  - Campus location proximity
- Real-time menu filtering
- Meal-time aware suggestions

### Cornell Dining Integration

- Fetches menus from Cornell's official API
- Stores menu data in Supabase for fast access
- Supports breakfast, lunch, and dinner filtering

## Usage

1. **Sign Up**: Create account with Cornell email
2. **Set Preferences**: Choose dietary restrictions, favorite dining halls, cuisines, and campus location
3. **Get Recommendations**: View personalized dining suggestions
4. **Filter by Meal**: See breakfast, lunch, or dinner options
5. **Update Preferences**: Modify preferences anytime from profile

## API Endpoints

- Cornell Dining API: `https://now.dining.cornell.edu/api/1.0/dining/eateries.json`

## Technologies Used

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Supabase (Auth, Database, API)
- **Navigation**: React Navigation
- **State Management**: React Context
- **Styling**: React Native StyleSheet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes and is not officially affiliated with Cornell University.

## Support

For issues or questions, please create an issue in the repository.
