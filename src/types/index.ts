export type NumberplateEntry = {
  id: string;
  imageUri: string;
  timestamp: number;
  score: number;
  categories: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type RootStackParamList = {
  Camera: undefined;
  Gallery: undefined;
}; 