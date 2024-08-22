////////////////////////////////////////////////
// Municipalité des îles-de-la-Madeleine
// Auteur :Iohann Paquette
// Date : 2024-05-07 
////////////////////////////////////////////////

///////////////////////////////////////////////
//                  IMPORTS
//////////////////////////////////////////////

import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet
} from 'react-native';
import FormButton from './FormButton';

const Popup = ({text,fct,fctText,setModalVisible,modalVisible,onCloseFct,...rest}) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => 
        {
          setModalVisible(!modalVisible)
          onCloseFct()
        }}
        {...rest}
        >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={{
                fontSize: 20,
                fontWeigth: 'bold',
                margin: 10,
              }}>
              {text}
            </Text>

            {(fct && fctText) && (
               <View
              style={{
                backgroundColor: 'red',
                margin: 10,
                padding: 10,
                borderRadius: 25,
              }}>
              <TouchableOpacity
                onPress={() => {
          
                  setModalVisible(!modalVisible);
                }}>
                <Text style={{ color: 'white' }}>{fctText}</Text>
              </TouchableOpacity>
            </View>
            )}
           

            {/* close modal button */}
            <FormButton buttonTitle={'Close'} backgroundColor='red' color='white' onPress={()=>setModalVisible(!modalVisible)}/>
          </View>
        </View>
      </Modal>
    );
  };

export default Popup;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});