import { GoogleGenerativeAI } from '@google/generative-ai';
import { SimplePreferences } from '../types/simplePreferences';

export class GeminiAIService {
  private static genAI: GoogleGenerativeAI | null = null;

  // Initialize Gemini AI
  private static initializeAI(): GoogleGenerativeAI | null {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found. Using fallback rule-based system.');
      return null;
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }

    return this.genAI;
  }

  // Analyze menu items with AI and generate recommendations
  static async analyzeMenuItems(
    menuItems: any[],
    preferences: SimplePreferences,
    diningHall: string,
    mealType: string
  ): Promise<{ mainDish: any; sideDish?: any; message: string } | null> {
    try {
      const genAI = this.initializeAI();
      
      if (!genAI) {
        // Fallback to rule-based system
        return this.fallbackAnalysis(menuItems, preferences, diningHall);
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Create a focused prompt for AI analysis
      const prompt = this.createAnalysisPrompt(menuItems, preferences, diningHall, mealType);
      
      console.log('🤖 Asking Gemini AI for recommendation...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Gemini AI response:', text);

      // Parse AI response
      return this.parseAIResponse(text, menuItems);

    } catch (error) {
      console.error('❌ Gemini AI error:', error);
      console.log('🔄 Falling back to rule-based system');
      
      // Fallback to rule-based system
      return this.fallbackAnalysis(menuItems, preferences, diningHall);
    }
  }

  // Create a focused prompt for AI analysis
  private static createAnalysisPrompt(
    menuItems: any[],
    preferences: SimplePreferences,
    diningHall: string,
    mealType: string
  ): string {
    // Extract user preferences
    const selectedProteins = Object.entries(preferences.proteins)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);
    
    const selectedMeals = Object.entries(preferences.mainMeals)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key.replace('_', ' '));
    
    const selectedSides = Object.entries(preferences.sides)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);
    
    const selectedFocus = Object.entries(preferences.focus)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key.replace('_', ' '));

    // Create menu items summary
    const menuSummary = menuItems.slice(0, 15).map(item => 
      `- ${item.name}${item.category ? ` (${item.category})` : ''}${item.description ? `: ${item.description.slice(0, 50)}...` : ''}`
    ).join('\n');

    // Create context for more personalized messages
    const timeOfDay = mealType.toLowerCase();
    const focusContext = selectedFocus.length > 0 ? selectedFocus.join(', ') : '';

    return `You are an enthusiastic and knowledgeable dining recommendation assistant for Cornell University students. Your job is to create exciting, personalized meal recommendations with creative and unique messages.

🏫 DINING HALL: ${diningHall}
🍽️ MEAL TYPE: ${mealType}

👤 USER PREFERENCES:
- Proteins: ${selectedProteins.length > 0 ? selectedProteins.join(', ') : 'Open to anything'}
- Main meals: ${selectedMeals.length > 0 ? selectedMeals.join(', ') : 'Open to anything'}
- Sides: ${selectedSides.length > 0 ? selectedSides.join(', ') : 'Open to anything'}
- Focus: ${selectedFocus.length > 0 ? selectedFocus.join(', ') : 'Just hungry!'}

📋 AVAILABLE MENU ITEMS:
${menuSummary}

🎯 TASK: Recommend ONE main dish and optionally ONE side dish that perfectly matches the user's preferences. Create a unique, engaging message that:
- References their specific preferences
- Uses food-related emojis and fun language
- Mentions why this combo works for ${timeOfDay}
- Includes motivational or fun phrases
- Varies in tone (excited, encouraging, playful, etc.)

MESSAGE STYLE EXAMPLES:
- "🔥 This combo is absolutely fire for ${timeOfDay}! Your taste buds will thank you!"
- "💪 Perfect fuel for your day! This hits all your cravings just right!"
- "🌟 Found your match! This is exactly what your soul ordered!"
- "⚡ Energy boost incoming! This combo is going to make your day amazing!"
- "🎉 Jackpot! This is the perfect storm of flavors you're craving!"

RESPONSE FORMAT (must be exactly this JSON structure):
{
  "mainDish": "exact menu item name",
  "sideDish": "exact menu item name or null", 
  "message": "Creative, unique message (max 120 characters) with emojis and personality"
}

REQUIREMENTS:
- Use EXACT menu item names from the list above
- Make each message completely unique and creative
- Include relevant emojis (🔥💪⚡🌟🎉🍽️etc.)
- Reference their preferences when possible
- Keep messages under 120 characters
- If no good match exists, return null for mainDish
- Vary your language and tone to keep it fresh!`;
  }

  // Parse AI response into structured format
  private static parseAIResponse(
    aiResponse: string, 
    menuItems: any[]
  ): { mainDish: any; sideDish?: any; message: string } | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in AI response, using fallback');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.mainDish) {
        return null;
      }

      // Find the actual menu items by name
      const mainDish = menuItems.find(item => 
        item.name.toLowerCase().includes(parsed.mainDish.toLowerCase()) ||
        parsed.mainDish.toLowerCase().includes(item.name.toLowerCase())
      );

      let sideDish = null;
      if (parsed.sideDish && parsed.sideDish !== 'null') {
        sideDish = menuItems.find(item => 
          item.name.toLowerCase().includes(parsed.sideDish.toLowerCase()) ||
          parsed.sideDish.toLowerCase().includes(item.name.toLowerCase())
        );
      }

      if (!mainDish) {
        console.warn('⚠️ AI recommended item not found in menu');
        return null;
      }

      return {
        mainDish,
        sideDish,
        message: parsed.message || 'Great choice! Enjoy your meal! 🍽️'
      };

    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      return null;
    }
  }

  // Fallback rule-based analysis (same as before)
  private static fallbackAnalysis(
    menuItems: any[],
    preferences: SimplePreferences,
    diningHall: string
  ): { mainDish: any; sideDish?: any; message: string } | null {
    console.log('🔄 Using rule-based fallback system');

    // Find matching items using keyword matching (simplified version of old logic)
    const matchingItems = menuItems.filter(item => {
      const fullText = `${item.name} ${item.category} ${item.description}`.toLowerCase();
      
      // Check proteins
      if (preferences.proteins.chicken && /chicken|poultry/i.test(fullText)) return true;
      if (preferences.proteins.beef && /beef|steak/i.test(fullText)) return true;
      if (preferences.proteins.seafood && /fish|salmon|shrimp|seafood/i.test(fullText)) return true;
      
      // Check main meals  
      if (preferences.mainMeals.pizza && /pizza/i.test(fullText)) return true;
      if (preferences.mainMeals.pasta && /pasta|spaghetti/i.test(fullText)) return true;
      if (preferences.mainMeals.burgers && /burger/i.test(fullText)) return true;
      
      return false;
    });

    if (matchingItems.length === 0) {
      return null;
    }

    const mainDish = matchingItems[0];
    const sideDish = matchingItems.length > 1 ? matchingItems[1] : null;

    // Generate creative fallback messages
    const creativeFallbackMessages = [
      `🔥 Amazing find at ${diningHall}! This combo is going to hit different! 💫`,
      `⚡ Jackpot! Found the perfect ${diningHall} meal for you! 🎯`,
      `🌟 Your taste buds called - they want this ${diningHall} combo! 😋`,
      `💪 Fuel up time! This ${diningHall} selection is chef's kiss! 👌`,
      `🎉 Plot twist: ${diningHall} has exactly what you need! Let's go! 🚀`,
      `✨ Magic happens at ${diningHall}! This combo is pure perfection! 🔮`
    ];
    
    const randomMessage = creativeFallbackMessages[Math.floor(Math.random() * creativeFallbackMessages.length)];

    return {
      mainDish,
      sideDish,
      message: randomMessage
    };
  }
}
