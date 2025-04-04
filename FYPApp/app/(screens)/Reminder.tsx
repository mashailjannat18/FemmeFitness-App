import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Reminder = () => {
  const [isReminderOn, setIsReminderOn] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('8');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState('PM');
  const [currentTime, setCurrentTime] = useState('');

  // Generate hours, minutes, and AM/PM options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const amPmOptions = ['AM', 'PM'];

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setIsReminderOn(prev => !prev);
  };

  const handleSaveTime = () => {
    setShowTimePicker(false);
    // Here you would typically save the time to your state/backend
  };

  const formattedTime = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Daily Reminder</Text>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <Text style={styles.timeLabel}>Current Time</Text>
      </View>
      
      <View style={styles.switchContainer}>
        <TouchableOpacity 
          onPress={handleToggle}
          activeOpacity={0.8}
          style={styles.toggleButton}
        >
          <View style={styles.labelContainer}>
            <Text style={[styles.label, !isReminderOn && styles.activeLabel]}>OFF</Text>
            <Text style={[styles.label, isReminderOn && styles.activeLabel]}>ON</Text>
          </View>
          
          <View style={[styles.switchTrack, isReminderOn && styles.switchTrackActive]}>
            <View style={[styles.switchThumb, isReminderOn && styles.switchThumbActive]} />
          </View>
        </TouchableOpacity>
      </View>
      
      {isReminderOn && (
        <View style={styles.notificationBox}>
          <Text style={styles.notificationText}>
            Reminder set for {formattedTime} daily
          </Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.editButtonText}>Edit Time</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Reminder Time</Text>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={(itemValue: string) => setSelectedHour(itemValue)}
                  style={styles.picker}
                >
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
                <Text style={styles.pickerLabel}>Hour</Text>
              </View>
              
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={(itemValue: string) => setSelectedMinute(itemValue)}
                  style={styles.picker}
                >
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
                <Text style={styles.pickerLabel}>Minute</Text>
              </View>
              
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedAmPm}
                  onValueChange={(itemValue: string) => setSelectedAmPm(itemValue)}
                  style={styles.picker}
                >
                  {amPmOptions.map(ampm => (
                    <Picker.Item key={ampm} label={ampm} value={ampm} />
                  ))}
                </Picker>
                <Text style={styles.pickerLabel}>AM/PM</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '200',
    color: '#2c3e50',
    fontFamily: 'Helvetica Neue',
  },
  timeLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    letterSpacing: 1,
  },
  switchContainer: {
    width: '80%',
    maxWidth: 300,
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#bdc3c7',
  },
  activeLabel: {
    color: '#2c3e50',
  },
  switchTrack: {
    width: 60,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: '#ff99aa',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 30 }],
    backgroundColor: '#d63384',
  },
  notificationBox: {
    marginTop: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  notificationText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#ff99aa',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  pickerWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#ff99aa',
  },
  modalButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default Reminder;