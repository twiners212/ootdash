import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const API_BASE = 'http://localhost:3000';

// Fallback data used when API is unreachable
const fallbackData = {
  weather: {
    temperature: 24,
    condition: "Cerah Berawan",
    locationName: "Salatiga"
  },
  recommendation: {
    top: { itemName: "Kemeja Flannel", note: "Nyaman dan hangat untuk suhu sejuk", layerImage: "/layers/top_kemeja_flannel.png" },
    bottom: { itemName: "Celana Chino", note: "Cocok untuk aktivitas kasual", layerImage: "/layers/bottom_celana_chino.png" },
    shoes: { itemName: "Sneakers", note: "Mudah dipakai jalan jauh", layerImage: "/layers/shoes_sneakers.png" },
    accessories: { itemName: "Topi", note: "Melindungi dari sinar matahari", layerImage: "/layers/acc_topi.png" }
  }
};

export const useDashboardStore = create((set, get) => ({
  weather: null,
  recommendation: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchDashboardData: async (lat, lon) => {
    set({ isLoading: true, error: null });
    try {
      // Get access token from auth store
      const token = useAuthStore.getState().getAccessToken();

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/dashboard?lat=${lat}&lon=${lon}`, {
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        set({
          weather: result.data.weather,
          recommendation: result.data.recommendation,
          isLoading: false,
          lastFetched: new Date().toISOString(),
        });
      } else {
        throw new Error(result.message || 'Unexpected response format');
      }
    } catch (err) {
      console.error('[DashboardStore] Fetch failed, using fallback:', err.message);
      // Use fallback data so the UI isn't empty
      set({
        weather: fallbackData.weather,
        recommendation: fallbackData.recommendation,
        error: `⚠️ Menggunakan data offline: ${err.message}`,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
