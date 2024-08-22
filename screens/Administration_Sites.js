////////////////////////////////////////////////
// Municipalité des Îles-de-la-Madeleine
// Auteur : Iohann Paquette
// Date : 2024-05-07
/* Objectif: Pouvoir contrôler les différents sites des Îles-de-la-Madeleine
grâce à une interface web. De plus, nous connectons cette plateforme à
un serveur Python, qui lui se connectera à un thermostat intelligent */
////////////////////////////////////////////////

////////////////////////////////////////////////
// Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { ref, onValue, get } from 'firebase/database';
import { Calendar } from 'react-native-calendars';
import CsvDownloadButton from 'react-json-to-csv';
import moment from 'moment'; // Importation de moment.js
import Ionicons from '@expo/vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import Checkbox from 'expo-checkbox';
////////////////////////////////////////////////
// Components
////////////////////////////////////////////////
import Header from '../components/header';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { database } from '../firebase/fire';
import axios from 'axios';

const Administration = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [collectedData, setCollectedData] = useState([]);
    const [monthData, setMonthData] = useState([])
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showCalendar, setShowCalendar] = useState(false);
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [sortByAsc, setSortByAsc] = useState(true);
    const [selectedZone, setSelectedZone] = useState('CGMR_2');
    const [zones, setZones] = useState([]);
    const [serverIsRunning,setServerisRunning] = useState(false)
    const [viewHumidity, setViewHumidity] = useState(false)
    const [viewFanIsRunning, setViewFanIsRunning] = useState(false)

    const month = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
    const currentMonth = moment(selectedDate).month()
    const mois = month[currentMonth]

    const url_server = 'https://munilesthermostats.pythonanywhere.com/'

    const getFormattedDate = (date) => {
        return moment(date).format('YYYY-MM-DD') + '-THERMOSTAT_DATA';
    };

    const fetchData = async() => {
        try {
            setCollectedData([]);
            // Aller chercher les différentes zones
            const zoneRef = ref(database, '/');

            onValue(zoneRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const uniqueZones = []
                    Object.keys(data).forEach((zoneName) => {
                        uniqueZones.push({
                            zoneName: zoneName
                        });
                    });
                    // Mettre à jour les zones avec les noms uniques
                    setZones(uniqueZones);
                }
            });

            // Aller chercher les data des zones
            const dataMonth = ref(database, `${selectedZone}`)
            const res = await get(dataMonth);

            if (res.exists()) {
                const data = res.toJSON();
                const keys = Object.keys(data);

                // Transform the data for CSV
                let csvData = [];
                let csvHeaders = [
                    "cool_setpoint",
                    "device_id",
                    "display_temperature",
                    "display_units",
                    "fan_is_running",
                    "heat_setpoint",
                    "outdoor_humidity",
                    "outdoor_temperature",
                    "timestamp",
                    "zone_name"
                ];
                csvData.push(csvHeaders);

                keys.forEach((key) => {
                    let month = key.split('-')[1];
                    month = month.startsWith('0') ? month.slice(1) : month;

                    if (parseInt(month, 10) === currentMonth + 1) {
                        Object.keys(data[key]).forEach((id)=>{
                                csvData.push([
                                    data[key][id].cool_setpoint,
                                    data[key][id].device_id,
                                    data[key][id].display_temperature,
                                    data[key][id].display_units,
                                    data[key][id].fan_is_running,
                                    data[key][id].heat_setpoint,
                                    data[key][id].outdoor_humidity,
                                    data[key][id].outdoor_temperature,
                                    data[key][id].timestamp,
                                    data[key][id].zone_name
                                ]);
                            })
                        
                     
                    }
                });

                setMonthData(csvData);
            }

            const formattedDate = getFormattedDate(selectedDate);
            const dataRef = ref(database, `${selectedZone}/${formattedDate}`);

            onValue(dataRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const formattedData = Object.values(data);

                    setCollectedData(formattedData);
                    setSortByAsc(sortByAsc)
                }
            });

            setShowCalendar(false)

        } catch (err) {
            console.log(err);
            setTextModal("Erreur lors de la requête des données. Réessayez plus tard.");
            setModalVisible(true);
        }
    };

    const sortByDate = () => {
        const sortedData = [...collectedData].sort((a, b) => {
            const dateA = moment(a.timestamp);
            const dateB = moment(b.timestamp);
            return sortByAsc ? dateA - dateB : dateB - dateA;
        });
        setCollectedData(sortedData);
        setSortByAsc(!sortByAsc); // Inverser l'ordre de tri après chaque clic
    };

    const startServer = async() =>
    {
        setLoading(true)
        await axios.post(url_server+'start')
        .then((res)=>{
            setServerisRunning(true)
            setTextModal('Serveur parti ! :) ')
            setModalVisible(true)
        })
        .catch((err)=>{
            console.log(err)
            setModalVisible(true)
            setTextModal('Erreur lors du démarrage du serveur, veuillez réessayer plus tard...')
        })
        setLoading(false)
    }

    const stopServer = async() =>{
        setLoading(true)

        await axios.post(url_server + 'stop')
        .then(()=>{
            setServerisRunning(false)
            setTextModal('Serveur arrete ! :)')
            setModalVisible(true)
        })
        .catch((err)=>{
            console.log(err)
            setModalVisible(true)
            setTextModal("Erreur lors de l' arrêt du serveur, veuillez réessayer plus tard...")
        })

        setLoading(false)
    }

    const getStatus = async() =>{
        await axios.get(url_server + 'get_status')
        .then((res)=>{
            const status = res.status
            if(status == 205){
                setServerisRunning(true)
                setTextModal('Le serveur roule !')
                setModalVisible(true)
            }
            else if (status == 206)
            {
                setServerisRunning(false)
                setTextModal('Le serveur est présentement arrêté !')
                setModalVisible(true)
            }

        })
        .catch((err)=>console.log(err))
    }

    useEffect(() => {
        setLoading(true);

        fetchData();
        getStatus()

        setLoading(false);
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size={'large'} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'Administration'} />

            <ScrollView style={styles.formContainer}>

                <View style={styles.section}>
                    {showCalendar ? (
                        <View>
                            <Text style={styles.headerText}>
                                Sélection de la zone
                            </Text>
                            <View style={styles.zonesContainer}>
                                {zones.map((zone, index) => {

                                    return (
                                        <TouchableOpacity key={index} onPress={() => {
                                            setSelectedZone(zone.zoneName);
                                        }}>
                                            <View style={index % 2 === 0 ? styles.dataRowPair : styles.dataRowImpair}>
                                                <Text style={styles.cellText}>
                                                    {zone.zoneName}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>

                            <Text style={styles.headerText}>
                                Sélection de la date
                            </Text>

                            <View style={styles.calendarContainer}>
                                <Calendar
                                    onDayPress={(day) => setSelectedDate(day.dateString)}
                                    markedDates={{
                                        [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' },
                                    }}
                                    maxDate={moment(new Date()).format('YYYY-MM-DD')}
                                    theme={{arrowColor:'#060270'}}
                                />
                                <Text style={styles.title}>{selectedDate.toString()}</Text>


                            </View>
                            <View style={styles.buttonGroup}>
                                <FormButton
                                    buttonTitle={'Confirmer'}
                                    onPress={fetchData}
                                    backgroundColor='green'
                                    color='white'
                                />
                                <FormButton
                                    onPress={() => setShowCalendar(false)}
                                    buttonTitle={'Annuler'}
                                    backgroundColor={'red'}
                                    color={'white'}
                                />
                            </View>

                        </View>


                    ) : (
                        <View style={styles.buttonGroup}>
                            <View>
                                <TouchableOpacity onPress={() => setShowCalendar(true)} style={{ backgroundColor: '#E9ECEF', flex: 2, flexDirection: 'row', justifyContent: 'center' }}>
                                    <Text style={styles.title}>Paramètres</Text>
                                    <Ionicons
                                        name='settings-sharp'
                                        size={30}
                                        color={'gray'}
                                        style={{ padding: 5 }}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View>
                                {serverIsRunning ? (
                                    <FormButton buttonTitle={'Arrêter le serveur'} backgroundColor='red' onPress={stopServer} color='white'/>
                                ):(
                                    <FormButton buttonTitle={'Démarrer le serveur'} backgroundColor='green' onPress={startServer} color='white'/>
                                )}
                            </View>

                            <CsvDownloadButton data={collectedData} filename={`donnees_${selectedDate}.csv`}>
                                <Text style={styles.downloadButton}>Télécharger {moment(selectedDate).format('YYYY-MM-DD')}</Text>
                            </CsvDownloadButton>

                            <CsvDownloadButton data={monthData} filename={`donnees_${mois}.csv`}>
                                <Text style={styles.downloadButton}>Télécharger le mois</Text>
                            </CsvDownloadButton>
                        </View>
                    )}

                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>Données du {selectedDate} | {selectedZone}</Text>

                    {collectedData.length === 0 && (<Text style={styles.noDataText}>En recherche ...</Text>)}
                    {collectedData.length > 0 && (
                        <View>
                            <View style={styles.checkboxGroup}>
                                <View style={styles.checkboxContainer}>
                                    <Checkbox
                                        value={viewHumidity}
                                        onValueChange={() => setViewHumidity(!viewHumidity)}
                                    />
                                    <Text style={styles.checkboxLabel}>Humidité</Text>
                                </View>
                                <View style={styles.checkboxContainer}>
                                    <Checkbox
                                        value={viewFanIsRunning}
                                        onValueChange={() => setViewFanIsRunning(!viewFanIsRunning)}
                                    />
                                    <Text style={styles.checkboxLabel}>Fan</Text>
                                </View>
                            </View>

                            {viewHumidity && (
                                <LineChart
                                    data={{
                                        labels: collectedData.map((value, index) => index % 5 === 0 ? moment(value.timestamp).format('HH:mm') : ''),
                                        datasets: [
                                            {
                                                data: collectedData.map(value => isNaN(value.outdoor_humidity) ? 0 : value.outdoor_humidity),
                                                color: (opacity = 1) => `rgba(34, 32, 195, ${opacity})`,
                                                strokeWidth: 3,
                                                withDots: false,

                                            }
                                        ],
                                        legend: ['Outdoor humidity']
                                    }}
                                    width={Dimensions.get("window").width - 40}
                                    height={220}
                                    yAxisSuffix='%'
                                    chartConfig={{
                                        backgroundColor: "#ffffff",
                                        backgroundGradientFrom: "#ffffff",
                                        backgroundGradientTo: "#e6f2ff",
                                        decimalPlaces: 1,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            r: "6",
                                            strokeWidth: "2",
                                            stroke: "#e6f2ff"
                                        }
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            )}

                            {viewFanIsRunning && (
                                <LineChart
                                    data={{
                                        labels: collectedData.map((value, index) => index % 5 === 0 ? moment(value.timestamp).format('HH:mm') : ''),
                                        datasets: [
                                            {
                                                data: collectedData.map(value => value.fan_is_running ? 1 : 0),
                                                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                                                strokeWidth: 2,
                                                withDots: false,
                                            }
                                        ],
                                        legend: ['Fan is running']
                                    }}
                                    width={Dimensions.get("window").width - 40}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: "#ffffff",
                                        backgroundGradientFrom: "#ffffff",
                                        backgroundGradientTo: "#e6f2ff",
                                        decimalPlaces: 1,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16,
                                        },
                                        propsForDots: {
                                            r: "6",
                                            strokeWidth: "2",
                                            stroke: "#e6f2ff"
                                        }
                                    }}
                                    style={styles.chart}
                                />
                            )}

                            <LineChart
                                data={{
                                    labels: collectedData.map((value, index) => index % 5 === 0 ? moment(value.timestamp).format('HH:mm') : ''),
                                    datasets: [
                                        {
                                            data: collectedData.map(value => value.display_temperature),
                                            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                                            strokeWidth: 3,
                                            withDots: false,
                                        },
                                        {
                                            data: collectedData.map(value => value.outdoor_temperature),
                                            color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`,
                                            strokeWidth: 3,
                                            withDots: false,
                                        }
                                    ],
                                    legend: ['Temp. int.', 'Temp. ext.']
                                }}
                                width={Dimensions.get("window").width - 40}
                                height={220}
                                yAxisSuffix='°C'
                                chartConfig={{
                                    backgroundColor: "#ffffff",
                                    backgroundGradientFrom: "#ffffff",
                                    backgroundGradientTo: "#e6f2ff",
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#e6f2ff"
                                    }
                                }}
                                bezier
                                style={styles.chart}
                            />


                            <View style={styles.table}>
                                <View style={styles.tableRowHeader}>
                                    <TouchableOpacity onPress={sortByDate} style={styles.sortButton}>
                                        <Text style={styles.cellTextHeader}>Heure</Text>
                                        <Ionicons name={sortByAsc ? 'arrow-up' : 'arrow-down'} size={20} color="white" />
                                    </TouchableOpacity>
                                    <Text style={styles.cellTextHeader}>Temp. int. (°C)</Text>
                                    <Text style={styles.cellTextHeader}>Temp. ext. (°C)</Text>
                                    <Text style={styles.cellTextHeader}>Fan</Text>
                                    <Text style={styles.cellTextHeader}>Humidité (%)</Text>
                                </View>
                                {collectedData.map((data, index) => (
                                    <View key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                                        <Text style={styles.cellText}>{moment(data.timestamp).format('HH:mm')}</Text>
                                        <Text style={styles.cellText}>{data.display_temperature}</Text>
                                        <Text style={styles.cellText}>{data.outdoor_temperature}</Text>
                                        <Text style={styles.cellText}>{data.fan_is_running ? 'ON' : 'OFF'}</Text>
                                        <Text style={styles.cellText}>{data.outdoor_humidity}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Popup
                text={textModal}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 10
    },
    formContainer: {
        padding: 15,
        backgroundColor: '#FFFFFF', // White background for forms
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    section: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#495057', // Dark grey for header text
        marginBottom: 10,
        padding: 10
    },
    zonesContainer: {
        borderWidth: 1,
        borderColor: '#CED4DA', // Light grey border
        borderRadius: 8,
        overflow: 'hidden',
    },
    dataRowPair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#E9ECEF', // Slightly darker grey for even rows
        alignItems: 'center',
        padding: 10,
    },
    dataRowImpair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F8F9FA', // Light grey for odd rows
        alignItems: 'center',
        padding: 10,
    },
    cellText: {
        fontSize: 16,
        color: '#212529', // Very dark grey for cell text
    },
    calendarContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343A40', // Dark grey for titles
        marginBottom: 10,
        padding: 10
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#868E96', // Medium grey for no data text
        marginBottom: 20,
    },
    checkboxGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 16,
        marginLeft: 8,
        color: '#495057', // Dark grey for checkbox label
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
    },
    sortButtonText: {
        color: 'white',
        fontSize: 16,
        marginRight: 8,
    },
    table: {
        borderWidth: 1,
        borderColor: '#CED4DA', // Light grey border for the table
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#6C757D', // Medium grey for table headers
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    cellTextHeader: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    tableRowEven: {
        flexDirection: 'row',
        backgroundColor: '#F1F3F5', // Very light grey for even rows
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tableRowOdd: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF', // White for odd rows
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    cellText: {
        flex: 1,
        fontSize: 14,
        color: '#212529', // Very dark grey for cell text
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButton: {
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: '#1D3557', // Navy blue for download button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
});

export default Administration;