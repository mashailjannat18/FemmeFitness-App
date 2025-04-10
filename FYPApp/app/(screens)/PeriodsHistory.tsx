import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

function PeriodsHistory() {
  const navigation = useNavigation();

  const getPastMonths = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 5; i++) {
      const pastDate = new Date(currentDate);
      pastDate.setMonth(currentDate.getMonth() - i);
      const year = pastDate.getFullYear();
      const month = String(pastDate.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);  // Fixed: Use template literals with backticks
    }
    return months;
  };

  const pastMonths = getPastMonths();

  const base64Image =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PDw8PDw8PDw8PDw8PDQ8PDw8PDw8PFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDQ0NDw0PDy0ZFRkrKzc3LSstLSsrNzc3Kys3LTc3LTcrKystLS0rLSsrKy0rKysrKy0rKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAABAAIDBAf/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAECAwT/xAAXEQEBAQEAAAAAAAAAAAAAAAAAAREC/9oADAMBAAIRAxEAPwD7LEkj0JJCJJAkkKkkCSQJkigzRSzajcZrFatYtGoK51qsVHSCiGqDRhRwRRoQjKiSwEYDFDGmWoJWlihwYZxNYgd0krmkkCSQJLUCSQJIUAyaBqCs2m1i1GoLWLTaxaNyCsVrqs1G4G4y0FKgIhIwiJJAjAVC1BGoM0xqMxqDNKWIR1QSsEJAQkCSQGIIEKqzRYhaqzUagtYtNYtG5Fa52m1m1G5BQjBo6QhCdGoRqIERKrVAMagMVDGoCMtGAwQpIZdEErJQ1CnUEBSQiFOs2grQhUagrFNYtG5F1XO02ufVRuRWsWmsjcMIQrRCEJjLQhLMOiHSIRDDBGoqGNQQwZMMCEaQQjZGrRkoalCgQUSQK1lUCxWsWmsVGpBax1TaxaOkgtZtVrN6RuQWqDVBppMnRG4mSIWozCBUEakErUIKsqNQNQQkSGDK1JAkgDqkhhJIEYEBoQoFm1Ws2jUgtYtNrHVG5GbWbV1WLUdJBaxarWUbkahjMMFMIKoTKydGWjrMIN8tRmNQYpjUBismGCEQwhCEVCgtQIrsghgpIRJIEzaazaLBWabWLRuRm1i09Vjqo6SDqufVPVY1HSQWjVaoNNRLVBCkQKgjSpTGpBG4MUxqCNSEYqjQaiojEhlA0Wiq1lUUU6mdQr06hFo5FJARUzoK1m1Ws2jUitc+qbXPqjpIuq59U2ufVR0kFrFp6rGo3IYRqlFah1kiGNMwiNNMxqQStSOkjPMaVzpxqBqKyo1ARlELQFCotFVotVrIq1IIuPUklcjFQtBUK1m0WQWsWm1i0bkHVY6q7rFqOkg6rn1TaxajpIumYLVo1jUMY0wG9QlOiFuMRqCNR05YjpFYrUawNDnTCIVZaWqAQs02s0WK0LRRUEEaIOgHpSSuSFqtFoSK1i1WsWjcitY6q6rn1UbkXVcuq11XO1HWQdVi1WsaNyNatYlalRWtMZMqo01GZTKJW2uWI68wZrfMbjMbiuVMajMagzTGoIVZSTNoG1m1WiiqgCo1ip1lCtwDSGPRKmVquWKs2q1m0akFrHVNrnekbkXVcuqeunLqo6yK1jqrqufVG5FaLWdVRvGmtc2hG4YzKYI3IYzG5FSt8x15jHMdORz6bjUZjSudahEMIzTpAVDoWs6EiFotGo1hoC0aKCAli1A9OjSlc2KxaUjUcuq52pI6Ry6rHVSHWOd6c+qUjcZ1aUKtagQNNRIZbjpwkrNdeXSJDlWo3AlYrUKSxharQkBWShqM2s2pDQhSFStSAJIH/9k=';

  return (
    <ImageBackground source={{ uri: base64Image }} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>📅 Periods History</Text>
          <Text style={styles.subHeading}>Track your cycle with ease</Text>
        </View>

        {pastMonths.map((month, index) => (
          <View key={index} style={styles.calendarContainer}>
            <Text style={styles.monthHeader}>
              {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <Calendar
              current={month}
              hideExtraDays={true}
              firstDay={1}
              disableMonthChange={true}
              enableSwipeMonths={false}
              hideArrows={true}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                monthTextColor: '#8B004F',
                dayTextColor: '#333',
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
                selectedDayBackgroundColor: '#8B004F',
                selectedDayTextColor: '#fff',
                todayTextColor: '#8B004F',
                arrowColor: '#8B004F',
                textSectionTitleColor: '#8B004F',
                textDisabledColor: '#d3d3d3',
                dotColor: '#8B004F',
                selectedDotColor: '#fff',
              }}
              style={styles.calendar}
            />
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B004F',
  },
  subHeading: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  calendarContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#8B004F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#d28ca4',
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B004F',
    marginBottom: 10,
    textAlign: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#d28ca4',
    borderRadius: 12,
    width: '100%',
  },
});

export default PeriodsHistory;