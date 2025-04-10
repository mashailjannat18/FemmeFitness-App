import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Reminder = () => {
  const [isReminderOn, setIsReminderOn] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState('8');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState('PM');
  const [currentTime, setCurrentTime] = useState('');

  // Background image URL (replace this with your own Google image link)
  const backgroundImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=';

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
    <ImageBackground
      source={{ uri: backgroundImageUrl }}
      style={styles.container}
    >
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Ensuring a background overlay for text contrast
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#b03060', // Darker pink for heading text
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: {
    fontSize: 22,
    color: '#b03060', // Darker pink for current time
  },
  timeLabel: {
    fontSize: 14,
    color: '#b03060',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  label: {
    fontSize: 18,
    color: '#aaa',
    marginHorizontal: 5,
  },
  activeLabel: {
    color: '#b03060',
  },
  switchTrack: {
    width: 60,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#ddd',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#b03060',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  notificationBox: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 18,
    color: '#b03060',
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#b03060',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#b03060',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    width: '30%',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#b03060',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    width: 120,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#b03060',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default Reminder;
