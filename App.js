////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from './firebase/fire'
import { useEffect,useContext,createContext } from 'react';

const Stack = createNativeStackNavigator();
export const UserContext = createContext();

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import LoginScreen from './screens/Login';
import HomeScreen from './screens/HomeScreen';
import MazoutConsommationForm from './screens/MazoutConsommation';
import Administration from './screens/Administration_Sites';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const App = () => {

  const [user, setUser] = useState();

  useEffect(()=>{
    onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
      }
    });
  },[auth])

  return (
    <NavigationContainer>
      {/* if user is null and yet not connected */}
      {!user && (
        <Stack.Navigator>
          <Stack.Screen name="Connexion" component={LoginScreen} />
        </Stack.Navigator>
      )}

      {/* if user is connected */}
      {user && (
        <UserContext.Provider value={user}>
          <Stack.Navigator>
            <Stack.Screen name="Accueil" component={HomeScreen} />
            <Stack.Screen name="MazoutConsommationForm" component={MazoutConsommationForm} />
            <Stack.Screen name="Administration" component={Administration} />

          </Stack.Navigator>
        </UserContext.Provider>
      )}
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
