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
    const [userPortal,setUserPortal] = useState()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isConnect, setIsConnect] = useState(false)

    const [frequency, setFrequency] = useState('');
    const [frequencyType, setFrequencyType] = useState('minutes'); // 'minutes', 'hours', 'days'
    const [loading, setLoading] = useState(false)
    const [isCollecting, setIsCollecting] = useState(false)
    const [choix,setChoix] = useState()
    const [zones,setZones] = useState([])
    const [collectedData, setCollectedData] = useState([]);

    const ipAdress = '127.0.0.1'

    const startCollection = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`http://${ipAdress}:5000/start`, {
                choix: parseInt(choix),
                frequency: parseInt(frequency),
                frequency_type: frequencyType,
            });

            if(response.statusText == 'OK')
            {
                setIsCollecting(true)

                const eventSource = new EventSource(`http://${ipAdress}:5000/events`);
                eventSource.onerror = (error) =>{
                    setIsCollecting(false)
                    setLoading(false)
                    alert('Error', 'Ereur lors de l obtention des donnes...');
                    console.error(error);
                    
                }
                eventSource.onmessage = (event) => {
                    setLoading(false)

                    const newData = event.data;
                    setCollectedData((prevData) => [...prevData, newData]);
                };
            }
            else
            {
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
            const response = await axios.post(`http://${ipAdress}:5000/stop`);
            setLoading(false)
            setIsCollecting(false)
            alert('Success', 'Data collection stopped');
        } catch (error) {
            console.error(error);
            setLoading(false)
            alert('Error', 'Failed to stop data collection');
        }
    };

    const logout = async () => {
        try {
            setLoading(true)
            const response = await axios.post(`http://${ipAdress}:5000/logout`)
            
            if(response.statusText == 'OK')
            {
                setLoading(false)
                setIsCollecting(false)
                setIsConnect(false)
            }
            else
            {
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
            const response = await axios.post(`http://${ipAdress}:5000/connect`, {
                email,
                password,
            });

            if (response.statusText == 'OK')
                {                
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
            <View style={{ flex:1,alignItems:'center',justifyContent:'center'}}>
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
                        <Text style={styles.label}>Veuillez choisir la zone que vous souhaitez exploiter</Text>
                        {(!choix && zones) && (
                            zones.map((item,index)=>(
                                <View>
                                     <TouchableOpacity onPress={()=>setChoix(index)}>
                                         <View style={{backgroundColor:'white',margin:10}}>
                                             <Text style={styles.label}>{index} {item.id} - {item.name}</Text>
                                         </View>
                                     </TouchableOpacity>
                                 </View>
                             ))
                        )}

                        {choix && (
                             (!isCollecting ? (
                                <View>
                                    <FormInput
                                        valueUseState={frequency}
                                        useState={setFrequency}
                                        textContentType="numeric"
                                        label={'Fréquence de récolte'}
                                        placeholder={'1 min ? 2 min ...'}
                                    />
    
                                    <FormInput
                                        valueUseState={frequencyType}
                                        useState={setFrequencyType}
                                        textContentType="numeric"
                                        label={'Type de fréquence'}
                                        placeholder={'tous les min,heure,jours ?...'}
                                    />
                                    <View style={styles.buttonContainer}>
                                        <FormButton buttonTitle="Commencer la collecte des données" onPress={startCollection} />
                                        <FormButton buttonTitle="Deconnexion" onPress={logout} />
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.title}>Données récoltées : {collectedData.length}</Text>
                                    {collectedData.length > 0 && (
                                        <View>
                                            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Collected Data:</Text>
                                            {collectedData.map((data, index) => (
                                                <Text key={index}>{data}</Text>
                                            ))}
                                        </View>
                                    )}
                                    <View style={styles.buttonContainer}>
                                        <FormButton buttonTitle="Arreter la collecte" onPress={stopCollection} />
                                    </View>
                                </View>
                            ))
                        )}

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
        color:'white'
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
});