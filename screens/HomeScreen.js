import React from 'react';
import { StyleSheet, Text, View, WebView } from 'react-native';
import { auth } from '../firebase/fire';
import { signOut } from "firebase/auth";
import FormButton from '../components/FormButton';

const HomeScreen = ({ navigation }) => {
    const user = auth.currentUser

    const logout = () => {
        signOut(auth).then(() => {
            navigation.navigate("Connexion")
        }).catch((error) => {
            // An error happened.
        });
    }

    const enteliweb = 'http://10.1.1.15/enteliweb'
    const argument = { arg1: 'valeur1', arg2: 'valeur2' };
    const argumentsString = Object.keys(argument).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(argument[key])}`).join('&');
    const pageUrl = `${enteliweb}/page-tierce?${argumentsString}`;

    return (
        <View style={styles.container}>
            {/* Informations utilisateur */}
            <View style={styles.header}>
                <View>
                    <Text>{user.email}</Text>
                </View>

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

            {/* WebView pour afficher la page tierce avec les arguments */}
            <WebView
                source={{ uri: pageUrl }}
                style={{ flex: 1 }}
            />
        </View>
    );
}

export default HomeScreen;

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
