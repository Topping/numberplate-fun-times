import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { CameraScreen } from './src/screens/CameraScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { RootStackParamList } from './src/types';
import { TouchableOpacity, Text } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Gallery">
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            title: 'Capture Numberplate',
          }}
        />
        <Stack.Screen 
          name="Gallery" 
          component={GalleryScreen}
          options={({ navigation }) => ({
            title: 'Numberplates',
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Camera')}
                style={{ marginRight: 15 }}
              >
                <Text style={{ fontSize: 16, color: '#007AFF' }}>Camera</Text>
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
