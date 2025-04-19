import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Progress() {
  // Weight data
  const weightData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [65.0, 64.5, 63.8, 63.2],
        color: (opacity = 1) => `rgba(214, 51, 132, ${opacity})`, // Pink color
        strokeWidth: 2,
      },
    ],
  };

  // Calories data (line graph)
  const caloriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2200, 1600, 1000, 400, 1800, 2200, 2400], // Gained
        color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`, // Purple
        strokeWidth: 3,
      },
      {
        data: [500, 600, 450, 550, 700, 400, 650], // Burned
        color: (opacity = 1) => `rgba(72, 61, 139, ${opacity})`, // Darker purple
        strokeWidth: 3,
      },
    ],
  };

  // Sleep data (bar graph)
  const sleepData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [7, 6, 7.5, 6.5, 8, 9, 8],
        color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`, // Mustard for actual sleep
      },
      {
        data: [8, 8, 8, 8, 8, 8, 8],
        color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`, // Pink for recommended
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top metrics row */}
        <View style={styles.row}>
          <View style={styles.item}>
            <FontAwesome name="heartbeat" size={24} color="#FF0000" />
            <Text style={styles.itemText}>Workouts</Text>
          </View>
          <View style={styles.item}>
            <MaterialIcons name="local-fire-department" size={24} color="#FFA500" />
            <Text style={styles.itemText}>Calories</Text>
          </View>
          <View style={styles.item}>
            <FontAwesome name="clock-o" size={24} color="#00008B" />
            <Text style={styles.itemText}>Duration</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>History</Text>
        </View>

        {/* Weight chart */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Weight</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={weightData}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="kg"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(214, 51, 132, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#d63384",
                },
                propsForBackgroundLines: {
                  strokeWidth: 0.5,
                  stroke: '#e0e0e0',
                },
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>
        </View>

        {/* Calories chart */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Calories Gained vs Burned</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={caloriesData}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix=" kcal"
              yAxisInterval={400}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              withHorizontalLines={true}
              withVerticalLines={true}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: 5,
                  strokeWidth: 2,
                },
                propsForBackgroundLines: {
                  strokeWidth: 0.5,
                  stroke: '#e0e0e0',
                },
                fillShadowGradient: 'transparent',
                fillShadowGradientOpacity: 0,
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6a5acd' }]} />
              <Text style={styles.legendText}>Gained</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#483d8b' }]} />
              <Text style={styles.legendText}>Burned</Text>
            </View>
          </View>
        </View>

        {/* Sleep Track */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Sleep Track</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={sleepData}
              width={screenWidth - 80}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" hrs"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 219, 88, ${opacity})`, // Mustard color
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForBackgroundLines: {
                  strokeWidth: 0.4,
                  stroke: '#e0e0e0',
                },
                barPercentage: 0.9,
              }}
              style={styles.chartStyle}
            />
          </View>
        </View>

        {/* Generate Report Button */}
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Generate Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
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
    color: '#2F4F4F',
  },
  section: {
    marginBottom: 20,
    width: '100%',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartStyle: {
    borderRadius: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  reportButton: {
    backgroundColor: '#FF69B4',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-end',
    width: '12%',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});