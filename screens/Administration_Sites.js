//////////////////////////////////////////////
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
import { ref, onValue } from 'firebase/database';
import { Calendar } from 'react-native-calendars';
import CsvDownloadButton from 'react-json-to-csv';
import moment from 'moment'; // Importation de moment.js
import { Feather } from "@expo/vector-icons";
import { LineChart } from 'react-native-chart-kit';

////////////////////////////////////////////////
// Components
////////////////////////////////////////////////
import Header from '../components/header';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { database } from '../firebase/fire';

const Administration = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [collectedData, setCollectedData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [showCalendar, setShowCalendar] = useState(false);
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [sortByAsc, setSortByAsc] = useState(true);
    const [selectedZone, setSelectedZone] = useState('THERMOSTAT_2');
    const [zones, setZones] = useState([]);

    const getFormattedDate = (date) => {
        return moment(date).format('YYYY-MM-DD') + '-THERMOSTAT_DATA';
    };

    const fetchData = () => {
        try {
            setLoading(true);
            setCollectedData([]);
            setSelectedZone(null);
            // Aller chercher les différentes zones
            const zoneRef = ref(database, '/');

            onValue(zoneRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const uniqueZones = new Set();
                    Object.keys(data).forEach((key) => {
                        Object.keys(data[key]).forEach((zoneName, i) => {
                            uniqueZones.add(zoneName);
                        });
                    });
                    // Mettre à jour les zones avec les noms uniques
                    setZones([...uniqueZones]);

                    // Sélectionner la première zone par défaut
                    if (uniqueZones.size > 0) {
                        setSelectedZone(uniqueZones.values().next().value);
                    }
                }

            });

            // Aller chercher les data des zones
            console.log(selectedZone);
            const formattedDate = getFormattedDate(selectedDate);
            const dataRef = ref(database, `9159953/${selectedZone}/${formattedDate}`);

            onValue(dataRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const formattedData = Object.values(data);
                    setCollectedData(formattedData);
                    setSortByAsc(sortByAsc)
                }
            });

        } catch (err) {
            console.log(err);
            setTextModal("Erreur lors de la requête des données. Réessayez plus tard.");
            setModalVisible(true);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        fetchData();
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
                <View style={{ backgroundColor: 'white' }}>
                    <Text style={styles.headerText}>
                        Veuillez choisir une zone parmi les suivantes
                    </Text>
                    {zones.length > 0 && (
                        <View>

                            {zones.map((zone, index) => (
                                <TouchableOpacity key={index} onPress={() => setSelectedZone(zone)}>
                                    <View style={index % 2 === 0 ? styles.dataRowPair : styles.dataRowImpair}>
                                        <Text style={styles.cellText}>
                                            {index + 1} - {zone}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>


                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {showCalendar && (
                        <View>
                            <Calendar
                                onDayPress={(day) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' },
                                }}
                            />
                            <Text style={styles.title}>{selectedDate.toString()}</Text>
                        </View>
                    )}
                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <FormButton
                            buttonTitle={'Confirmer'}
                            onPress={fetchData}
                        />
                        <FormButton
                            onPress={() => setShowCalendar(!showCalendar)}
                            buttonTitle={showCalendar ? 'Annuler' : 'Sélectionner une autre date'}
                        />
                    </View>
                </View>

                {collectedData.length === 0 && (<Text style={styles.title}>En recherche ...</Text>)}
                {collectedData.length > 0 && (
                    <View>

                        <LineChart
                            data={{
                                labels: collectedData.map((value, index) => index % 5 === 0 ? moment(value.timestamp).format('HH:mm') : ''),
                                datasets: [
                                    {
                                        data: collectedData.map(value => value.display_temperature),
                                        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                                        strokeWidth: 3
                                    },
                                    {
                                        data: collectedData.map(value => value.outdoor_temperature),
                                        color: (opacity = 1) => `rgba(34, 193, 195, ${opacity})`,
                                        strokeWidth: 3
                                    }
                                ],
                                legend: ['Temp. int.', 'Temp. ext.']
                            }}
                            width={Dimensions.get("window").width - 100}
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
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                padding: 10,
                                margin: 20
                            }}
                        />


                        <View style={styles.buttonContainer}>
                            <CsvDownloadButton data={collectedData} filename={`Thermostat_${selectedDate}`} />
                        </View>

                        <View style={styles.tableContainer}>

                            <View style={styles.tableHeader}>
                                <TouchableOpacity onPress={sortByDate}>
                                    <Text style={styles.headerText}>
                                        Date
                                        <Feather
                                            name={sortByAsc ? 'arrow-up':'arrow-down'}
                                            size={25}
                                        />
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Zone</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Temp. intérieure (°C)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Temp. extérieure (°C)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Hum. extérieure (%)</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Point de consigne chaud</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Point de consigne froid</Text>
                            </View>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerText}>Ventilateur en fonctionnement</Text>
                            </View>
                        </View>

                        {collectedData.map((value, index) => (
                            <View style={index % 2 === 0 ? styles.dataRowPair : styles.dataRowImpair} key={index}>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>
                                        {moment(value.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.zone_name}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.display_temperature}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.outdoor_temperature}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.outdoor_humidity}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.heat_setpoint}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.cool_setpoint}</Text>
                                </View>
                                <View style={styles.dataCell}>
                                    <Text style={styles.cellText}>{value.fan_is_running ? 'Oui' : 'Non'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <Popup
                    text={textModal}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                />
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3E6E8',
        alignItems: 'center',
        padding: 10,
    },
    formContainer: {
        width: '95%',
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    tableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FFF',
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 10,
    },
    dataRowPair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F5F8FA',
        alignItems: 'center',
        padding: 5,
    },
    dataRowImpair: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#E8ECEE',
        alignItems: 'center',
        padding: 5,
    },
    tableHeader: {
        width: '12%',
        borderRightWidth: 1,
        borderRightColor: '#D7DADC',
        padding: 10,
        backgroundColor: '#E3E6E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dataCell: {
        width: '12%',
        borderRightWidth: 1,
        borderRightColor: '#D7DADC',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 14,
    },
    cellText: {
        color: '#555',
        fontSize: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
});

export default Administration;
