////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { onAuthStateChanged ,getAuth} from 'firebase/auth';
import {auth} from './firebase/fire'
const Stack = createNativeStackNavigator();

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import LoginScreen from './screens/Login';
import HomeScreen from './screens/HomeScreen';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const App = ()=> {

  const [user, setUser] = useState();

  onAuthStateChanged(auth, (u) => {
    if (u) {
      setUser(u)
    } 
  });

  return (
      <NavigationContainer>
        <Stack.Navigator>
          {/* if user is null and yet not connected */}
          {!user && (
            <Stack.Screen name="Connexion" component={LoginScreen} />
          )}

          {/* if user is connected */}
          {user && (
            <Stack.Screen name="Accueil" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
