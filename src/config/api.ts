// API configuration
export const API_CONFIG = {
  // Change this to your actual API URL in production
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api',
  ENDPOINTS: {
    ANALYZE_NUMBERPLATE: '/numberplates/analyze',
    GET_NUMBERPLATES: '/numberplates',
  },
  HEADERS: {
    'Content-Type': 'application/json',
    // Add any additional headers here (e.g., authentication)
  },
}; 