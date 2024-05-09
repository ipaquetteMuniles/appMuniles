////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

////////////////////////////////////////////////
//Bibliothèques
////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Picker } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/fire';
import { doc, getDoc } from 'firebase/firestore';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs'; // For file management

////////////////////////////////////////////////
//Composants
////////////////////////////////////////////////
import Header from '../components/header';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import Popup from '../components/Popup';
import { lites_batiments_mazout } from '../utiles/liste_batiments_mazout';

const MazoutConsommationForm = ({ navigation, route }) => {
    const user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false)

    const [numProduit, setNumProduit] = useState('');
    const [date, setDate] = useState(new Date());

    //drodownlist
    const [nomsite, setNomsite] = useState('');

    const [prixTotal, setPrixTotal] = useState('');
    const [prixUnitaire, setPrixUnitaire] = useState('');
    const [nomMazout, setNomMazout] = useState('');
    const [quantite, setQuantite] = useState('');
    const [textModal, setTextModal] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const submit = async () => {

        if (!numProduit || !nomsite || !prixTotal || !prixUnitaire || !nomMazout || !quantite) {
            setTextModal('Assurez-vous de remplir tous les champs du formulaire.');
            setModalVisible(true);
        } else {
            await addDoc(collection(db, 'Consommation'), {
                date: date,
                numProduit: numProduit,
                nomsite: nomsite,
                prixUnitaire: prixUnitaire,
                prixTotal: prixTotal,
                nomMazout: nomMazout,
                quantite: quantite,
            })
                .then(() => {
                    setTextModal('Les données ont été enregistrées !');
                    setModalVisible(true);
                    setNumProduit('');
                    setDate(new Date());
                    setNomsite('');
                    setPrixTotal('');
                    setPrixUnitaire('');
                    setNomMazout('');
                    setQuantite('');
                })
                .catch((err) => {
                    setErreur('Erreur interne : Contacter iohann');
                    console.log(err);
                });
        }
    };

    const getUserInfo = async () => {
        const tableName = "Users"
        const docRef = doc(db, tableName, user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if (docSnap.data().isAdmin)
                setIsAdmin(true)
        } else {
            console.log("No such document!");
        }
    }

    const getMazoutData = async () => {
        //aller chercher toute les données du Mazout dans la BD
        const tableName = "Consommation"
        await getDocs(collection(db, tableName))
            .then((d) => {
                //foreach doc
                d.forEach((data) => {
                    console.log(data.data())
                })
            })

        //les convertirs dans un excel
    }

    const convertirEnCsv = async (data) => {
        try {
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert JSON data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(jsonData);

            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // Generate an Excel file in binary format
            const excelFile = XLSX.write(workbook, { type: 'binary', bookType: 'xlsx' });

            // Prepare file path based on platform
            let filePath = '';
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Permission Required',
                        message: 'This app needs access to your storage to save files',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    filePath = `${RNFS.DownloadDirectoryPath}/${fileName}.xlsx`;
                } else {
                    console.log('Permission denied');
                    return;
                }
            } else {
                filePath = `${RNFS.DocumentDirectoryPath}/${fileName}.xlsx`;
            }

            // Write the Excel file to the file path
            await RNFS.writeFile(filePath, excelFile, 'ascii');

            console.log('Excel file saved successfully at:', filePath);
        }
        catch (error) {
            console.error('Error converting JSON to Excel:', error);
        }
    }


    useEffect(() => {
        getUserInfo()

    }, [])

    return (
        <View style={styles.container}>
            <Header navigation={navigation} nomPage={'MazoutConsommationForm'} />
            <ScrollView>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Formulaire de consommation de Mazout</Text>

                    {/* si administrateur, alors peut downloader le excel avec données */}
                    {isAdmin && (
                        <View style={styles.buttonContainer}>

                            <FormButton
                                buttonTitle={'Télécharger les données'}
                                onPress={getMazoutData}
                            />
                        </View>

                    )}

                    <View style={styles.field}>
                        <Text style={styles.label}>Date</Text>
                        <Calendar
                            onDayPress={(day) => {
                                setDate(day.dateString);
                            }}
                            markedDates={{
                                [date]: { selected: true, disableTouchEvent: true, selectedDotColor: 'blue' },
                            }}
                            style={styles.calendar}
                            theme={styles.calendarTheme}
                        />
                    </View>

                    {/* Numéro de produit */}
                    <View style={styles.field}>
                        <FormInput
                            label={'Numéro de produit'}
                            placeholder={'# ...'}
                            useState={setNumProduit}
                            valueUseState={numProduit}
                            textContentType={'none'}
                        />
                    </View>


                    {/* Type de mazout */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Type de mazout"}
                            placeholder={"coloré, ... ?"}
                            useState={setNomMazout}
                            valueUseState={nomMazout}
                            textContentType={'none'}
                        />
                    </View>

                    {/* nomsite */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Nom du site</Text>
                        <Picker
                            selectedValue={nomsite}
                            onValueChange={(itemValue, itemIndex) =>
                                setNomsite(itemValue)
                            }>
                            <Picker.Item label={'Sélectionner un élément'} value={null} />
                            {lites_batiments_mazout.map((item, index) => (
                                <Picker.Item key={index} label={item} value={item} />
                            ))}
                        </Picker>
                    </View>

                    {/* Montant après taxe, total */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Montant total"}
                            placeholder={"après taxe ... $"}
                            useState={setPrixTotal}
                            valueUseState={prixTotal}
                            textContentType={'none'}
                        />
                    </View>

                    {/* Quantité */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Quantité (L)"}
                            placeholder={"Qt en litres"}
                            useState={setQuantite}
                            valueUseState={quantite}
                            textContentType={'number'}
                            keyboardType={'numeric'}
                        />
                    </View>

                    {/* Prix unitaire */}
                    <View style={styles.field}>
                        <FormInput
                            label={"Prix unitaire du litre"}
                            placeholder={"Prix au litre"}
                            useState={setPrixUnitaire}
                            valueUseState={prixUnitaire}
                            textContentType={'number'}
                            keyboardType={'numeric'}
                        />
                    </View>

                </View>

                {/* submit button */}
                <View style={styles.buttonContainer}>
                    <FormButton buttonTitle={'Enregistrer'} onPress={submit} />
                </View>
            </ScrollView>

            <Popup
                text={textModal}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
                onCloseFct={() => console.log('all good !')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060270',
        padding: 10,
    },
    formContainer: {
        backgroundColor: '#0E1442',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 25,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        color: 'white',
        marginBottom: 10,
    },
    calendar: {
        borderRadius: 10,
    },
    calendarTheme: {
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#2d4150',
        textDisabledColor: '#d9e',
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default MazoutConsommationForm;
