import { PlateResult } from '../types';

/**
 * Process a numberplate image through the API
 * @param imageBlob - The image blob to process
 * @returns A promise with the processing result
 */
export const processNumberplateImage = async (imageBlob: Blob): Promise<PlateResult> => {
  const apiEndpoint = localStorage.getItem('apiEndpoint');
  
  if (!apiEndpoint) {
    throw new Error('API endpoint not configured. Please set it in the Settings page.');
  }
  
  const formData = new FormData();
  formData.append('image', imageBlob, 'numberplate.jpg');
  
  const response = await fetch(`${apiEndpoint}/api/process-plate`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.numberplate) {
    throw new Error('No numberplate detected or recognized');
  }
  
  return {
    id: Date.now().toString(),
    numberplate: data.numberplate,
    timestamp: Date.now(),
    confidence: data.confidence,
  };
};

/**
 * Save a plate result to local storage
 * @param plate - The plate result to save
 */
export const savePlateToLocalStorage = (plate: PlateResult): void => {
  const savedPlates = localStorage.getItem('plates');
  const plates: PlateResult[] = savedPlates ? JSON.parse(savedPlates) : [];
  plates.push(plate);
  localStorage.setItem('plates', JSON.stringify(plates));
};

/**
 * Get all plates from local storage
 * @returns Array of plate results
 */
export const getPlatesFromLocalStorage = (): PlateResult[] => {
  const savedPlates = localStorage.getItem('plates');
  return savedPlates ? JSON.parse(savedPlates) : [];
};

/**
 * Delete a plate from local storage
 * @param id - The ID of the plate to delete
 * @returns boolean indicating success
 */
export const deletePlateFromLocalStorage = (id: string): boolean => {
  const savedPlates = localStorage.getItem('plates');
  if (!savedPlates) return false;
  
  const plates: PlateResult[] = JSON.parse(savedPlates);
  const updatedPlates = plates.filter(plate => plate.id !== id);
  localStorage.setItem('plates', JSON.stringify(updatedPlates));
  
  return true;
};

/**
 * Clear all plates from local storage
 */
export const clearAllPlatesFromLocalStorage = (): void => {
  localStorage.removeItem('plates');
}; 