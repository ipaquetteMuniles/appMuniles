////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,Image } from 'react-native';
import FormButton from '../components/FormButton';
import { signOut } from "firebase/auth";
import { useContext } from 'react';
////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import { auth} from '../firebase/fire';
import { UserContext } from '../App';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Header = ({ navigation, nomPage }) => {

    const { user,setUser } = useContext(UserContext);

    const logout = () => {
        signOut(auth).then(() => {
            //logout suceess
            setUser(null);
        }).catch((error) => {
            // An error happened.
        });
    }

    return (
        <View style={styles.header}>
            {/* logo */}
            <View>
                <Image source={require('../assets/Logo_Iles_de_la_Madeleine.png')}
                    resizeMode='contains'
                    width={50}
                    height={50}
                />
            </View>

            {/* courriel */}
            <View>
                <Text>{user.email}</Text>
            </View>

            {/* tabs */}
            {/* {nomPage != 'HomeScreen' && (
                <View>
                    <FormButton
                        buttonTitle={'Accueil'}
                        backgroundColor='#060270'
                        color='white'
                        onPress={() => navigation.navigate("Accueil")}
                    />
                </View>
            )} */}

            {nomPage != 'MazoutConsommationForm' && (
                <View>
                    <FormButton
                        buttonTitle={'Formulaire Mazout'}
                        backgroundColor='#060270'
                        color='white'
                        onPress={() => navigation.navigate("MazoutConsommationForm")}
                    />
                </View>
            )}

            {nomPage != 'PropaneConsommationForm' && (
                <View>
                    <FormButton
                        buttonTitle={'Formulaire Propane'}
                        backgroundColor='#060270'
                        color='white'
                        onPress={() => navigation.navigate("PropaneConsommationForm")}
                    />
                </View>
            )}

            {nomPage != 'Administration' && (
                <View>
                    <FormButton
                        buttonTitle={'Administration'}
                        backgroundColor='#060270'
                        color='white'
                        onPress={() => navigation.navigate("Administration")}
                    />
                </View>
            )}

            {/* Logout */}
            <View>
                <FormButton
                    buttonTitle={'Deconnexion'}
                    backgroundColor='red'
                    color='white'
                    onPress={logout}
                />
            </View>
        </View>
    );
}

export default Header;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060270',
        margin: 10,
        borderRadius: 60
    },
    header: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});


