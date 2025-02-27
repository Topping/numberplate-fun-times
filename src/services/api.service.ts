import { API_CONFIG } from '../config/api';
import { NumberplateEntry } from '../types';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeNumberplate(imageUri: string): Promise<NumberplateEntry> {
    // Create form data to send the image
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'numberplate.jpg',
    } as any);

    return this.request<NumberplateEntry>(API_CONFIG.ENDPOINTS.ANALYZE_NUMBERPLATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async syncNumberplates(numberplates: NumberplateEntry[]): Promise<NumberplateEntry[]> {
    return this.request<NumberplateEntry[]>(API_CONFIG.ENDPOINTS.GET_NUMBERPLATES, {
      method: 'POST',
      body: JSON.stringify({ numberplates }),
    });
  }
}

export const apiService = new ApiService(); 