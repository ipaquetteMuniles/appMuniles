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
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Link } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import Checkbox from 'expo-checkbox';

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import Header from '../components/header';
import { auth } from '../firebase/fire';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
////////////////////////////////////////////////
// App
////////////////////////////////////////////////
const Administration = ({ navigation, route }) => {

    //Constantes
    const [userPortal, setUserPortal] = useState()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isConnect, setIsConnect] = useState(false)

    const [frequency, setFrequency] = useState();
    const [selectedFrequencyType, setSelectedFrequencyType] = useState('');
    const frequencyTypes = ['minutes', 'hours', 'days']
    const [loading, setLoading] = useState(false)
    const [isCollecting, setIsCollecting] = useState(false)
    const [choix, setChoix] = useState()
    const [zones, setZones] = useState([])
    const [collectedData, setCollectedData] = useState([]);

    const local = 'http://127.0.0.1:5000'
    const ipAdress = 'https://iohann.pythonanywhere.com'
    const startCollection = async () => {

        if (choix == null) {
            alert('Veuillez choisir une zone')
            return
        }
        if (frequency == null)
        {
            alert('Veuillez indiquer un chiffre qui indique la fréquence de la récolte')
            return
        }
        try {
            setLoading(true);
            console.log('ici')
            const response = await axios.post(`${local}/start`, {
                choix: parseInt(choix),
                frequency: parseInt(frequency),
                frequency_type: selectedFrequencyType,
            });

            console.log(response)

            if (response.statusText == 'OK') {
                setIsCollecting(true)

                const eventSource = new EventSource(`${local}/events`);

                eventSource.onerror = (error) => {
                    setIsCollecting(false)
                    setLoading(false)
                    alert('Error', 'Ereur lors de l obtention des donnes...');
                    console.error(error);

                }
                setLoading(false)

                eventSource.onmessage = (event) => {
                    const newData = event.data;
                    console.log(newData);
                    setCollectedData((prevData) => [...prevData, newData]);
                };
            }
            else {
                setLoading(false);
                alert('Probleme en partant le serveur')
                return
            }


        } catch (error) {
            console.error(error);
            setIsCollecting(false)
            setLoading(false)
            alert('Error', 'Failed to start data collection');

        }
    };

    const stopCollection = async () => {
        try {
            setLoading(true)
            const eventSource = new EventSource(`${local}/events`);
            eventSource.close()

            const response = await axios.post(`${local}/stop`);

            if (response.statusText == 'OK') {
                alert('Success', 'Data collection stopped');
            }

            setLoading(false)
            setIsCollecting(false)
        } catch (error) {
            console.error(error);
            setLoading(false)
            alert('Error', 'Failed to stop data collection');
        }
    };

    const logout = async () => {
        try {
            //si l'utilisateur n'est pas connecter
            if(!userPortal)
            {
                setLoading(false)
                return
            }
            setLoading(true)
            const response = await axios.post(`${local}/logout`)

            if (response.statusText == 'OK') {
                setLoading(false)
                setIsCollecting(false)
                setIsConnect(false)
            }
            else {
                setLoading(false)
                console.log(error)
                alert(`Erreur lors de la deconnexion ${response.status}.. Aller sur le portail si cela est urgent`)
            }
        }
        catch (error) {
            setLoading(false)
            console.log(error)
            alert('Erreur lors de la deconnexion.. Aller sur le portail si cela est urgent')
        }
    }

    const connect = async () => {
        try {
            setLoading(true)
            const response = await axios.post(`${local}/connect`, {
                email,
                password,
            });

            if (response.statusText == 'OK') {
                const z = response.data.zones
                setZones(z)
                setIsConnect(true)
                setUserPortal(response.data.user)
            }
            setLoading(false)
        }
        catch (error) {
            console.error(error);
            setLoading(false)
            alert('Error', 'Failed to connect, retry later...');
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size={'large'} />
                <FormButton
                    buttonTitle={'Arreter'}
                    backgroundColor='red'
                    onPress={logout}
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'Administration'} />

            {
                !isConnect ? (
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Entrez vos informations de connexion pour la plateforme :
                            <Text onPress={() => open('https://mytotalconnectcomfort.com/portal/')} style={{ color: 'blue' }}>
                                https://mytotalconnectcomfort.com/portal/
                            </Text>
                        </Text>
                        <FormInput
                            label={'Courriel'}
                            placeholder={'name@muniles.ca'}
                            useState={setEmail}
                            valueUseState={email}
                            textContentType='emailAddress'
                        />
                        <FormInput
                            label={'Mot de passe'}
                            placeholder={'###'}
                            useState={setPassword}
                            valueUseState={password}
                            textContentType='password'
                            secureTextEntry={true}
                            multiline={false}
                        />

                        <View style={styles.buttonContainer}>

                            <FormButton
                                buttonTitle={'Se connecter au contrôle'}
                                onPress={connect}
                            />
                        </View>

                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Connecté en tant que {userPortal}</Text>

                        {
                            (!isCollecting ? (
                                <View>
                                    {(zones) && (
                                        zones.map((item, index) => (
                                            <View id={index}>
                                                <TouchableOpacity onPress={() => setChoix(index)}>
                                                    <View style={{ backgroundColor: 'white', margin: 10 }}>
                                                        <Text style={styles.label}>{index} {item.id} - {item.name}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}
                                    <FormInput
                                        valueUseState={frequency}
                                        useState={setFrequency}
                                        textContentType="numeric"
                                        label={'Fréquence de récolte'}
                                        placeholder={'1 min ? 2 min ...'}
                                    />


                                    {frequencyTypes.map((item, index) => (
                                        <View key={item}>
                                            <TouchableOpacity onPress={() => setSelectedFrequencyType(item)}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center',backgroundColor:'white' }}>
                                                       <Checkbox
                                                style={styles.checkbox}
                                                value={selectedFrequencyType === item}
                                                color={'#4630EB'}
                                            />                                            
                                            <Text>{index} - {item}</Text>

                                                </View>
                                            </TouchableOpacity>
                                         
                                        </View>
                                    ))}

                                    {choix != null && (
                                        <View style={{ backgroundColor: 'white', margin: 10 }}>
                                            <Text style={styles.label}>{choix} {zones[choix].id} - {zones[choix].name}</Text>
                                        </View>
                                    )}
                                    <View style={styles.buttonContainer}>
                                        <FormButton buttonTitle="Commencer la collecte des données" onPress={startCollection} />
                                        <FormButton buttonTitle="Deconnexion" onPress={logout} />
                                    </View>
                                </View>
                            ) : (
                                <ScrollView>
                                    <Text style={styles.title}>Données récoltées : {collectedData.length}</Text>
                                    {collectedData.length == 0 && (<Text style={styles.title}>En recherche ...</Text>)}
                                    {collectedData.length > 0 && (
                                        <View>
                                            <View style={{ backgroundColor: 'white', margin: 10 }}>
                                                <Text style={styles.label}>zone_id,zone_name,timestamp,indoor_temperature,outdoor_temperature,displayUnits,indoor_humidity,outdoor_humidity,heat_setpoint,cool_setpoint,fan_status</Text>
                                            </View>
                                            {collectedData.map((data, index) => (
                                                <View style={{ backgroundColor: 'white', margin: 10 }} id={index}>
                                                    <Text style={styles.label} key={index}>{index + 1}. - {data}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    <View style={styles.buttonContainer}>
                                        <FormButton buttonTitle="Arreter la collecte" onPress={stopCollection} />
                                    </View>
                                </ScrollView>
                            ))
                        }

                    </View>
                )
            }
        </View>
    );

}

export default Administration;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white'
    },
    formContainer: {
        backgroundColor: '#0E1442',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        marginBottom: 10,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    checkbox: {
        margin: 8,
    },
});