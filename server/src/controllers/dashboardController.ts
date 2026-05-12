import { Request, Response } from 'express';
import { eq, and, lte, gte } from 'drizzle-orm';
import db from '../db/index.js';
import { clothingRules, userPreferences } from '../db/schema.js';

// --- OpenWeatherMap condition → Local enum mapping ---
const OWM_CONDITION_MAP: Record<string, string> = {
  // Clear
  'Clear': 'Cerah',
  // Clouds
  'Clouds': 'Berawan',
  // Rain / Drizzle
  'Rain': 'Hujan',
  'Drizzle': 'Hujan',
  // Thunderstorm / Extreme
  'Thunderstorm': 'Badai',
  'Squall': 'Badai',
  'Tornado': 'Badai',
  // Other (fog, mist, haze, etc.) → default to Berawan
  'Mist': 'Berawan',
  'Smoke': 'Berawan',
  'Haze': 'Berawan',
  'Dust': 'Berawan',
  'Fog': 'Berawan',
  'Sand': 'Berawan',
  'Ash': 'Berawan',
  'Snow': 'Hujan', // Snow maps to Hujan (cold + wet)
};

// Translate OWM condition string to Indonesian display text
const CONDITION_DISPLAY: Record<string, string> = {
  'Cerah': 'Cerah',
  'Berawan': 'Cerah Berawan',
  'Hujan': 'Hujan',
  'Badai': 'Badai',
};

/**
 * Fetches current weather data from OpenWeatherMap API.
 */
async function fetchWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('OPENWEATHER_API_KEY is not configured. Please set it in .env');
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[WEATHER] OpenWeatherMap API error:', response.status, errorBody);
    throw new Error(`OpenWeatherMap API returned status ${response.status}`);
  }

  const data = await response.json();

  // Extract the main weather condition from OWM response
  const owmCondition = data.weather?.[0]?.main || 'Clear';
  const localCondition = OWM_CONDITION_MAP[owmCondition] || 'Berawan';

  return {
    temperature: Math.round(data.main.temp as number),
    condition: CONDITION_DISPLAY[localCondition] || localCondition,
    conditionKey: localCondition, // For DB lookup
    locationName: data.name as string,
  };
}

/**
 * Looks up clothing recommendations from the database based on
 * the user's style profile, current temperature, and weather condition.
 */
async function findRecommendation(userId: string, temperature: number, conditionKey: string) {
  // 1. Find user's style profile preference
  const userPref = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!userPref || !userPref.styleProfileId) {
    return null; // User has no style profile set
  }

  // 2. Query clothing rules matching the conditions
  const rules = await db
    .select()
    .from(clothingRules)
    .where(
      and(
        eq(clothingRules.styleProfileId, userPref.styleProfileId),
        eq(clothingRules.weatherCondition, conditionKey as any),
        lte(clothingRules.minTemp, temperature),
        gte(clothingRules.maxTemp, temperature),
      )
    )
    .limit(1);

  if (rules.length === 0) {
    return null; // No matching rule found
  }

  const rule = rules[0];

  return {
    top: {
      itemName: rule.topItem,
      note: rule.topNote,
      layerImage: `/layers/top_${rule.topItem.toLowerCase().replace(/\s+/g, '_')}.png`,
    },
    bottom: {
      itemName: rule.bottomItem,
      note: rule.bottomNote,
      layerImage: `/layers/bottom_${rule.bottomItem.toLowerCase().replace(/\s+/g, '_')}.png`,
    },
    shoes: {
      itemName: rule.shoesItem,
      note: rule.shoesNote,
      layerImage: `/layers/shoes_${rule.shoesItem.toLowerCase().replace(/\s+/g, '_')}.png`,
    },
    accessories: rule.accItem
      ? {
          itemName: rule.accItem,
          note: rule.accNote || '',
          layerImage: `/layers/acc_${rule.accItem.toLowerCase().replace(/\s+/g, '_')}.png`,
        }
      : null,
  };
}

// --- Fallback recommendations when DB has no data ---
const FALLBACK_RECOMMENDATIONS: Record<string, any> = {
  'Cerah': {
    top: { itemName: 'Kaos Polos', note: 'Ringan dan nyaman untuk cuaca cerah', layerImage: '/layers/top_kaos_polos.png' },
    bottom: { itemName: 'Celana Pendek', note: 'Adem untuk suhu tinggi', layerImage: '/layers/bottom_celana_pendek.png' },
    shoes: { itemName: 'Sandal', note: 'Santai dan breathable', layerImage: '/layers/shoes_sandal.png' },
    accessories: { itemName: 'Kacamata Hitam', note: 'Melindungi mata dari sinar UV', layerImage: '/layers/acc_kacamata.png' },
  },
  'Berawan': {
    top: { itemName: 'Kemeja Flannel', note: 'Nyaman dan hangat untuk suhu sejuk', layerImage: '/layers/top_kemeja_flannel.png' },
    bottom: { itemName: 'Celana Chino', note: 'Cocok untuk aktivitas kasual', layerImage: '/layers/bottom_celana_chino.png' },
    shoes: { itemName: 'Sneakers', note: 'Mudah dipakai jalan jauh', layerImage: '/layers/shoes_sneakers.png' },
    accessories: { itemName: 'Topi', note: 'Menyempurnakan tampilan kasual', layerImage: '/layers/acc_topi.png' },
  },
  'Hujan': {
    top: { itemName: 'Jaket Hujan', note: 'Waterproof untuk cuaca basah', layerImage: '/layers/top_jaket_hujan.png' },
    bottom: { itemName: 'Celana Panjang', note: 'Melindungi kaki dari percikan air', layerImage: '/layers/bottom_celana_panjang.png' },
    shoes: { itemName: 'Boots', note: 'Anti selip dan tahan air', layerImage: '/layers/shoes_boots.png' },
    accessories: { itemName: 'Payung', note: 'Wajib dibawa saat hujan', layerImage: '/layers/acc_payung.png' },
  },
  'Badai': {
    top: { itemName: 'Jaket Tebal', note: 'Perlindungan maksimal dari angin kencang', layerImage: '/layers/top_jaket_tebal.png' },
    bottom: { itemName: 'Celana Panjang Tebal', note: 'Hangat dan melindungi', layerImage: '/layers/bottom_celana_tebal.png' },
    shoes: { itemName: 'Boots Tinggi', note: 'Anti air dan kokoh', layerImage: '/layers/shoes_boots_tinggi.png' },
    accessories: { itemName: 'Payung', note: 'Pastikan payung kuat terhadap angin', layerImage: '/layers/acc_payung.png' },
  },
};

/**
 * GET /api/dashboard?lat={x}&lon={y}
 *
 * Main dashboard endpoint that combines weather data with clothing recommendations.
 */
export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lon } = req.query;

    // Validate query parameters
    if (!lat || !lon) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required query parameters: lat and lon',
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        status: 'error',
        message: 'lat and lon must be valid numbers',
      });
      return;
    }

    // 1. Fetch weather from OpenWeatherMap
    const weather = await fetchWeather(latitude, longitude);

    // 2. Try to find a DB-based recommendation for the authenticated user
    let recommendation = null;
    if (req.user?.sub) {
      try {
        recommendation = await findRecommendation(req.user.sub, weather.temperature, weather.conditionKey);
      } catch (dbErr) {
        console.warn('[DASHBOARD] DB recommendation lookup failed, using fallback:', (dbErr as Error).message);
      }
    }

    // 3. Fall back to hardcoded recommendations if no DB match
    if (!recommendation) {
      recommendation = FALLBACK_RECOMMENDATIONS[weather.conditionKey] || FALLBACK_RECOMMENDATIONS['Berawan'];
    }

    // 4. Return combined response matching the API contract
    res.json({
      status: 'success',
      data: {
        weather: {
          temperature: weather.temperature,
          condition: weather.condition,
          locationName: weather.locationName,
        },
        recommendation,
      },
    });
  } catch (err) {
    console.error('[DASHBOARD] Error:', err);
    res.status(500).json({
      status: 'error',
      message: (err as Error).message || 'Internal server error',
    });
  }
}
