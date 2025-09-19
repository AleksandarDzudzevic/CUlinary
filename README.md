# 🍽️ CUlinary - Cornell Dining Hall Food Recommender

> **🤖 AI-Powered Mobile App for Cornell University Students**  
> Get personalized meal recommendations from Cornell dining halls using real AI analysis and smart filtering.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-orange.svg)](https://ai.google.dev/)

## 📱 Overview

CUlinary is a React Native mobile app that helps Cornell University students discover the perfect meals at campus dining halls. Using **real AI analysis** powered by Google Gemini 🧠, the app provides personalized recommendations based on your food preferences, dietary restrictions, and meal focus (pre-workout, post-workout, healthy, etc.).

### 🎯 Key Features

- **🤖 AI-Powered Recommendations** - Real Google Gemini AI analyzes menu items and generates personalized suggestions
- **📋 Live Menu Data** - Real-time menu information from Cornell Dining API
- **✅ Smart Preferences** - Checkbox-based system for proteins, cuisines, meal types, and focus areas
- **🏢 Dining Hall Focus** - Only shows recommendations from your favorite dining halls
- **📅 Date & Meal Selection** - Browse menus by date and meal type (Breakfast, Lunch, Dinner)
- **🔄 Intelligent Caching** - Smart data fetching with automatic cleanup of old menus
- **💪 Workout Meal Options** - Pre-workout and post-workout meal recommendations
- **🍰 Dessert Support** - Special category for sweet treats
- **📱 Beautiful UI** - Modern, intuitive interface with Cornell branding

## 🛠️ Technology Stack

### **Frontend** 📱

- **React Native** (0.81.4) - Cross-platform mobile development
- **Expo** (SDK 54) - Development platform and build tools
- **TypeScript** - Type-safe JavaScript development
- **React Navigation** - Navigation library for screens and tabs
- **React Native Community Slider** - UI components for preferences

### **Backend & Database** 🗄️

- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security (RLS)** - Secure data access policies
- **JSONB Storage** - Flexible preference storage format

### **AI & APIs** 🤖

- **Google Gemini AI** (gemini-1.5-flash) - Real AI meal analysis and recommendations
- **Cornell Dining API** - Live menu data from Cornell University
- **Smart Fallback System** - Rule-based recommendations when AI is unavailable

### **Development Tools** ⚙️

- **Metro Bundler** - React Native JavaScript bundler
- **ESLint & TypeScript** - Code quality and type checking
- **Git** - Version control with proper .gitignore setup

## 🚀 Getting Started

### Prerequisites ✅

- **Node.js** (20.18.0+)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** or **Android Emulator** (or Expo Go app)

### Installation 📦

1. **Clone the repository**

   ```bash
   git clone https://github.com/YourUsername/CUlinary.git
   cd CUlinary
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:

   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Google Gemini AI Configuration (FREE)
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Set up Supabase Database**
   Run these SQL commands in your Supabase dashboard:

   ```sql
   -- Create user preferences table
   CREATE TABLE user_preferences (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     simple_preferences JSONB DEFAULT '{}',
     favorite_dining_halls TEXT[] DEFAULT '{}',
     campus_location TEXT DEFAULT '',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id)
   );

   -- Create menus table
   CREATE TABLE menus (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     eatery_id TEXT NOT NULL,
     eatery_name TEXT NOT NULL,
     menu_date DATE NOT NULL,
     meal_type TEXT NOT NULL,
     items JSONB DEFAULT '[]',
     campus_area TEXT DEFAULT '',
     location TEXT DEFAULT '',
     operating_hours JSONB DEFAULT '{}',
     menu_summary TEXT DEFAULT '',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(eatery_id, menu_date, meal_type)
   );
   ```

5. **Start the development server**

   ```bash
   npx expo start
   ```

6. **Run on device**
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go app

## 🗄️ Database Schema

### **User Preferences Table**

```sql
user_preferences {
  id: UUID (Primary Key)
  user_id: UUID (Foreign Key → auth.users)
  simple_preferences: JSONB {
    proteins: { chicken, beef, pork, seafood, vegetarian, vegan }
    mainMeals: { pizza, pasta, burgers, sandwiches, salads, stir_fry, soup, rice_bowls, desserts }
    sides: { fries, vegetables, rice, bread, fruit, chips }
    focus: { protein_heavy, low_carb, healthy, cheat_meal, comfort_food, pre_workout, post_workout }
  }
  favorite_dining_halls: TEXT[]
  campus_location: TEXT
}
```

### **Menus Table**

```sql
menus {
  id: UUID (Primary Key)
  eatery_id: TEXT
  eatery_name: TEXT
  menu_date: DATE
  meal_type: TEXT (Breakfast/Lunch/Dinner)
  items: JSONB (Array of menu items)
  campus_area: TEXT
  location: TEXT
  operating_hours: JSONB
  menu_summary: TEXT
}
```

## 🤖 AI Integration

### **Google Gemini AI Features**

- **Real-time Analysis** - AI reads actual menu items and descriptions
- **Personalized Messages** - Creative, unique recommendations with emojis
- **Context Awareness** - Considers meal type, dining hall, and user preferences
- **Fallback System** - Rule-based recommendations when AI is unavailable

## 📱 App Architecture

### **Navigation Structure**

```
📱 App
├── 🔐 Auth Stack (Login/SignUp)
└── 🏠 Main Stack
    ├── 📋 All Menus (Browse by date/meal)
    ├── 🤖 AI Recommendations (Personalized suggestions)
    └── 👤 Profile (Settings & preferences)
```

### **Key Services**

- **`aiRecommendations.ts`** - Main AI recommendation logic
- **`geminiAI.ts`** - Google Gemini AI integration
- **`cornellDining.ts`** - Cornell API data fetching
- **`databaseManager.ts`** - Smart caching and cleanup
- **`cornellFoodClassifier.ts`** - Food classification system

## 🔧 Configuration

### **Getting API Keys**

1. **Supabase Setup**

   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and anon key from Settings → API

2. **Google Gemini AI (FREE)**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Sign in with Google account
   - Create API key (free tier: 1,500 requests/day)

### **Dining Hall Names**

The app automatically maps preference names to database names:

```javascript
'Becker House Dining' → 'Becker House Dining Room'
'Hans Bethe House' → "Jansen's Dining Room at Bethe House"
'Morrison Dining' → 'Morrison Dining'
// ... and more
```

## 🚀 Deployment

### **Build for Production**

```bash
# iOS
npx expo build:ios

# Android
npx expo build:android

# Web
npx expo build:web
```

### **Expo Application Services (EAS)**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for app stores
eas build --platform all
```

## 🧪 Testing

### **Run Tests**

```bash
npm test
```

### **Type Checking**

```bash
npx tsc --noEmit
```

### **Linting**

```bash
npx eslint . --ext .ts,.tsx
```

## 📊 Features in Detail

### **Smart Recommendation System**

1. **User selects preferences** - Simple checkbox interface
2. **AI analyzes menus** - Google Gemini reads menu items and descriptions
3. **Personalized matching** - Finds items that match user preferences
4. **Creative messages** - AI generates unique, engaging recommendations
5. **Dining hall filtering** - Only shows user's favorite locations

### **Intelligent Data Management**

- **Smart API calls** - Only fetches when needed (every 6 hours)
- **Automatic cleanup** - Removes old menu data daily
- **Offline fallback** - Cached data when network unavailable
- **Real-time updates** - Live menu data from Cornell Dining

### **User Experience**

- **Cornell branding** - University logo and colors
- **Intuitive navigation** - Easy-to-use tab-based interface
- **Responsive design** - Works on all screen sizes
- **Error handling** - Graceful fallbacks and user guidance

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cornell University** - For providing the dining API
- **Google AI** - For the free Gemini AI tier
- **Supabase** - For the excellent backend platform
- **Expo Team** - For the amazing development tools
- **React Native Community** - For the open-source components

---

**Made with ❤️ for Cornell University students**
