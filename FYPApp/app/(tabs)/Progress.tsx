import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function Progress() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.item}>
          <FontAwesome name="heartbeat" size={24} color="black" />
          <Text style={styles.itemText}>Workouts</Text>
        </View>
        <View style={styles.item}>
          <MaterialIcons name="local-fire-department" size={24} color="black" />
          <Text style={styles.itemText}>Calories</Text>
        </View>
        <View style={styles.item}>
          <FontAwesome name="clock-o" size={24} color="black" />
          <Text style={styles.itemText}>Duration</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>History</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Weight</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Calories Burned</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Sleep Track</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Generate Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  item: {
    alignItems: 'center',
  },
  itemText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    alignSelf: 'flex-start', 
    marginVertical: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#d63384',
    padding: 10, 
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
