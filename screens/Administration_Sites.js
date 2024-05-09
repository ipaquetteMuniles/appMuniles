////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07
/* Objectif: Pouvoir controller les différents sites des îles de
la madeleine grâce a une interface web. En plus, nous connections cette plateforme a
un serveur python, qui lui se connectera a un thermostat intelligent */
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import { StyleSheet, Text, View,ScrollView } from 'react-native';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import Header from '../components/header';
import { auth } from '../firebase/fire';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Administration = () => {

    const user = auth.currentUser

    const envoyerRequeteServeur = () => {
        // Exemple en utilisant fetch
        const url = 'http://votre_adresse_ip_locale:5000/set_temperature'
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                heat_temperature: 20, // Température pour le chauffage
                cool_temperature: 25, // Température pour la climatisation
            }),
        })
            .then(response => response.text())
            .then(data => {
                console.log(data); // Message de confirmation de la modification de la température
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header navigation={navigation} nomPage={'Administration'} />

            <ScrollView>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 25, color: 'white', fontWeight: 'bold' }}>
                        Administration des sites
                    </Text>

                    {/* site 1 */}
                    <View></View>

                    {/* site 2 */}
                    <View></View>
                </View>

            </ScrollView>
        </View>
    );
}

export default Administration;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060270',
        margin: 10,
        borderRadius: 60
    },
});
