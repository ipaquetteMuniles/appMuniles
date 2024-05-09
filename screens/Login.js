////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../firebase/fire'

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////

const LoginScreen = ({ navigation, route }) => {
    //usestate
    [courriel, setCourriel] = useState("");
    [mdp, setMdp] = useState("");

    const connect = () => {
        console.log('Connection ...')
        signInWithEmailAndPassword(auth, courriel, mdp)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    return (
        <View style={styles.container}>
            {/* logo */}
            <Image
                source={require('../assets/Logo_Iles_de_la_Madeleine.png')}
                resizeMethod='contains'
                style={{ width: '20%', width: '20%' }}
            />
            {/* courriel */}
            <FormInput 
                label={'Courriel'}
                placeholder={'name@muniles.ca'}
                useState={setCourriel}
                valueUseState={courriel}
                textContentType='emailAddress'
            />

            {/* field 2 - MDP */}
            <FormInput 
                label={'Mot de passe'}
                placeholder={'###'}
                useState={setMdp}
                valueUseState={mdp}
                textContentType='password'
                secureTextEntry={true}
            />

            {/* submit button */}
            <FormButton onPress={connect} buttonTitle={'Connexion'} />
        </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060270',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        borderRadius: 60
    },
    field: {
        flex: 2,
        flexDirection: 'column',
        margin: 10,
        alignItems:'center',
        justifyContent:'center'
    }
});
