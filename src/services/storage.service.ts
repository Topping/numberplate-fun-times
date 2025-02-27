import AsyncStorage from '@react-native-async-storage/async-storage';
import { NumberplateEntry } from '../types';

const STORAGE_KEYS = {
  NUMBERPLATES: 'numberplates',
};

class StorageService {
  async getNumberplates(): Promise<NumberplateEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NUMBERPLATES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading numberplates:', error);
      return [];
    }
  }

  async saveNumberplates(numberplates: NumberplateEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NUMBERPLATES,
        JSON.stringify(numberplates)
      );
    } catch (error) {
      console.error('Error saving numberplates:', error);
      throw error;
    }
  }

  async addNumberplate(numberplate: NumberplateEntry): Promise<void> {
    const numberplates = await this.getNumberplates();
    numberplates.push(numberplate);
    await this.saveNumberplates(numberplates);
  }

  async updateNumberplate(updatedPlate: NumberplateEntry): Promise<void> {
    const numberplates = await this.getNumberplates();
    const index = numberplates.findIndex(plate => plate.id === updatedPlate.id);
    if (index !== -1) {
      numberplates[index] = updatedPlate;
      await this.saveNumberplates(numberplates);
    }
  }
}

export const storageService = new StorageService(); 