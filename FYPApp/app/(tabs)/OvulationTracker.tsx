import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useUserAuth } from '@/context/UserAuthContext';
import { supabase } from '@/lib/supabase';
import Logo from '@/assets/images/Logo.png';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

export default function OvulationTracker() {
  const { user, refreshUser } = useUserAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('Loading...');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRecalibrationDate, setLastRecalibrationDate] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [bleedingDays, setBleedingDays] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchTodayPhase = async () => {
    if (!user?.id) {
      setCurrentPhase('User not logged in');
      return;
    }

    try {
      const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const { data, error, count } = await supabase
        .from('MenstrualCyclePhases')
        .select('cycle_day, phase', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error || count === 0) {
        console.log('No data or error:', error?.message);
        const { data: allPhases, error: allPhasesError } = await supabase
          .from('MenstrualCyclePhases')
          .select('date', { count: 'exact' })
          .eq('user_id', user.id);

        if (allPhasesError || allPhases.length === 0) {
          setCurrentPhase('Late for period logging');
          setCurrentCycleDay(null);
        } else {
          setCurrentPhase('Phase data not available');
          setCurrentCycleDay(null);
        }
        return;
      }

      setCurrentCycleDay(data.cycle_day);
      setCurrentPhase(data.phase || 'Unknown Phase');
    } catch (error) {
      console.error('Error in fetchTodayPhase:', error);
      setCurrentPhase('Error fetching phase');
      setCurrentCycleDay(null);
    }
  };

  const recalibrateCycle = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('http://192.168.1.3:5000/api/recalibrate-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to recalibrate cycle:', errorText);
        return;
      }

      const result = await response.json();
      const recalibratedPhases = result.recalibrated_phases;

      if (!recalibratedPhases || !Array.isArray(recalibratedPhases)) {
        console.error('Invalid recalibrated phases structure:', recalibratedPhases);
        return;
      }

      const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      await supabase
        .from('MenstrualCyclePhases')
        .delete()
        .eq('user_id', user.id)
        .gte('date', today);

      const insertData = recalibratedPhases.map(phase => ({
        user_id: user.id,
        date: phase.date,
        cycle_day: phase.cycle_day,
        phase: phase.phase,
      }));

      const { error: insertError } = await supabase
        .from('MenstrualCyclePhases')
        .insert(insertData);

      if (insertError) {
        console.error('Failed to insert recalibrated phases:', insertError);
        return;
      }

      console.log('Successfully updated MenstrualCyclePhases with recalibrated data');
      const currentDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      await AsyncStorage.setItem('lastRecalibrationDate', currentDate);
      setLastRecalibrationDate(currentDate);

      await fetchTodayPhase();
    } catch (error) {
      console.error('Error in recalibrateCycle:', error);
    }
  };

  const checkAndRecalibrate = async () => {
    if (!user?.id) return;

    try {
      const storedDate = await AsyncStorage.getItem('lastRecalibrationDate');
      setLastRecalibrationDate(storedDate);

      if (!storedDate) {
        await recalibrateCycle();
        return;
      }

      const lastDate = new Date(storedDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 5) {
        console.log('5 days have passed since last recalibration, recalibrating now...');
        await recalibrateCycle();
      }
    } catch (error) {
      console.error('Error in checkAndRecalibrate:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkAndRecalibrate();
      await fetchTodayPhase();
      const { data, error } = await supabase
        .from('User')
        .select('bleeding_days, last_period_date')
        .eq('id', user?.id)
        .single();
      if (error || !data) {
        console.error('Failed to fetch initial user data:', error);
      } else {
        setBleedingDays(data.bleeding_days?.toString() || '');
        setLastPeriodDate(data.last_period_date || '');
      }
    };
    initialize();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('Refresh started');
    try {
      await fetchTodayPhase();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
      console.log('Refresh completed');
    }
  }, [user?.id]);

  const formatDateToDDMMYYYY = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleLogPeriod = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const formattedToday = formatDateToDDMMYYYY(today);
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('cycle_length, bleeding_days, age, weight, height')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Failed to fetch user data');
      }

      const response = await fetch('http://192.168.1.3:5000/api/predict-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastPeriodDate: formattedToday,
          cycleLength: userData.cycle_length,
          bleedingDays: userData.bleeding_days,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to predict cycle: ${errorText}`);
      }

      const result = await response.json();
      const newCyclePhases = result.cycle_phases;

      const currentDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const { data: currentPhaseData } = await supabase
        .from('MenstrualCyclePhases')
        .select('phase')
        .eq('user_id', user.id)
        .eq('date', currentDate)
        .single();

      const isBeforeLuteal = !currentPhaseData || currentPhaseData.phase !== 'Luteal';

      if (isBeforeLuteal) {
        await supabase
          .from('MenstrualCyclePhases')
          .delete()
          .eq('user_id', user.id);

        const insertData = newCyclePhases.map(phase => ({
          user_id: user.id,
          date: phase.date,
          cycle_day: phase.cycle_day,
          phase: phase.phase,
        }));

        await supabase.from('MenstrualCyclePhases').insert(insertData);
        await supabase
          .from('User')
          .update({ last_period_date: today })
          .eq('id', user.id);
      } else {
        const insertData = newCyclePhases.map(phase => ({
          user_id: user.id,
          date: phase.date,
          cycle_day: phase.cycle_day,
          phase: phase.phase,
        }));

        await supabase.from('MenstrualCyclePhases').insert(insertData);
      }

      await supabase
        .from('User')
        .update({ last_period_date: today })
        .eq('id', user.id);

      const { data: workoutPlanData, error: workoutError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (workoutError || !workoutPlanData) {
        throw new Error('No active workout plan found');
      }

      const startDate = new Date(workoutPlanData.start_date);
      const currentDateObj = new Date();
      const daysElapsed = Math.floor((currentDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        age: userData.age,
        activityLevel: 50, // Placeholder
        goal: 'stay_fit', // Placeholder
        weight: userData.weight,
        challengeDays: 30, // Placeholder
        preferredRestDay: 'Sunday', // Placeholder
        height: userData.height,
        currentDay: daysElapsed,
        userId: user.id,
        workoutPlanId: workoutPlanData.id,
      };

      const planResponse = await fetch('http://192.168.1.3:5000/api/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!planResponse.ok) {
        throw new Error('Failed to update plans');
      }

      const planResult = await planResponse.json();
      await supabase.rpc('update_user_and_workout_plan', {
        p_user_id: user.id,
        p_weight: userData.weight,
        p_activity_level: 50, // Placeholder
        p_challenge_days: 30, // Placeholder
        p_workout_plan: planResult.workout_plan,
        p_meal_plan: planResult.meal_plan,
        p_start_date: currentDateObj.toISOString().split('T')[0],
        p_intensity: planResult.intensity,
        p_goal: 'stay_fit', // Placeholder
        p_last_period_date: today,
        p_cycle_length: userData.cycle_length,
        p_bleeding_days: userData.bleeding_days,
      });

      await refreshUser();
      Alert.alert('Success', 'Period logged and plans updated');
      await fetchTodayPhase();
    } catch (error) {
      console.error('Error in handleLogPeriod:', error);
      Alert.alert('Error', `Failed to log period: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!user?.id) return;

    const newBleedingDays = parseInt(bleedingDays);
    if (isNaN(newBleedingDays) || newBleedingDays < 2 || newBleedingDays > 7) {
      Alert.alert('Error', 'Bleeding days must be between 2 and 7');
      return;
    }

    setEditModalVisible(false);
    try {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('cycle_length, age, weight, height')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Failed to fetch user data');
      }

      const formattedLastPeriodDate = formatDateToDDMMYYYY(lastPeriodDate);

      const response = await fetch('http://192.168.1.3:5000/api/predict-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastPeriodDate: formattedLastPeriodDate,
          cycleLength: userData.cycle_length,
          bleedingDays: newBleedingDays,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to predict cycle: ${errorText}`);
      }

      const result = await response.json();
      const newCyclePhases = result.cycle_phases;

      const currentDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const { data: currentPhaseData } = await supabase
        .from('MenstrualCyclePhases')
        .select('phase')
        .eq('user_id', user.id)
        .eq('date', currentDate)
        .single();

      const isBeforeLuteal = !currentPhaseData || currentPhaseData.phase !== 'Luteal';

      if (isBeforeLuteal) {
        await supabase
          .from('MenstrualCyclePhases')
          .delete()
          .eq('user_id', user.id);

        const insertData = newCyclePhases.map(phase => ({
          user_id: user.id,
          date: phase.date,
          cycle_day: phase.cycle_day,
          phase: phase.phase,
        }));

        await supabase.from('MenstrualCyclePhases').insert(insertData);
        await supabase
          .from('User')
          .update({ last_period_date: lastPeriodDate, bleeding_days: newBleedingDays })
          .eq('id', user.id);
      } else {
        const insertData = newCyclePhases.map(phase => ({
          user_id: user.id,
          date: phase.date,
          cycle_day: phase.cycle_day,
          phase: phase.phase,
        }));

        await supabase.from('MenstrualCyclePhases').insert(insertData);
      }

      await supabase
        .from('User')
        .update({ last_period_date: lastPeriodDate })
        .eq('id', user.id);

      const { data: workoutPlanData, error: workoutError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (workoutError || !workoutPlanData) {
        throw new Error('No active workout plan found');
      }

      const startDate = new Date(workoutPlanData.start_date);
      const currentDateObj = new Date();
      const daysElapsed = Math.floor((currentDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        age: userData.age,
        activityLevel: 50, // Placeholder
        goal: 'stay_fit', // Placeholder
        weight: userData.weight,
        challengeDays: 30, // Placeholder
        preferredRestDay: 'Sunday', // Placeholder
        height: userData.height,
        currentDay: daysElapsed,
        userId: user.id,
        workoutPlanId: workoutPlanData.id,
      };

      const planResponse = await fetch('http://192.168.1.3:5000/api/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!planResponse.ok) {
        throw new Error('Failed to update plans');
      }

      const planResult = await planResponse.json();
      await supabase.rpc('update_user_and_workout_plan', {
        p_user_id: user.id,
        p_weight: userData.weight,
        p_activity_level: 50, // Placeholder
        p_challenge_days: 30, // Placeholder
        p_workout_plan: planResult.workout_plan,
        p_meal_plan: planResult.meal_plan,
        p_start_date: currentDateObj.toISOString().split('T')[0],
        p_intensity: planResult.intensity,
        p_goal: 'stay_fit', // Placeholder
        p_last_period_date: lastPeriodDate,
        p_cycle_length: userData.cycle_length,
        p_bleeding_days: newBleedingDays,
      });

      await refreshUser();
      Alert.alert('Success', 'Cycle data updated and plans regenerated');
      await fetchTodayPhase();
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      Alert.alert('Error', `Failed to update cycle data: ${error.message}`);
    }
  };

  const handleEditDataPress = () => {
    setEditModalVisible(true);
  };

  const handleHistoryPress = () => {
    router.push('/(screens)/PeriodsCalendar');
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const onDayPress = (day: any) => {
    const selectedDate = day.dateString;
    setLastPeriodDate(selectedDate);
    setShowCalendar(false);
  };

  const symptoms = [
    { id: 'headache', icon: 'head-outline', label: 'Headache', color: '#FF6F61' },
    { id: 'stomachache', icon: 'stomach', label: 'Stomach Ache', color: '#6B5B95' },
    { id: 'nausea', icon: 'emoticon-sick-outline', label: 'Nausea', color: '#88B04B' },
    { id: 'cramps', icon: 'run-fast', label: 'Cramps', color: '#FFA500' },
    { id: 'backache', icon: 'human-handsup', label: 'Backache', color: '#92A8D1' },
  ];

  const renderItem = () => (
    <View>
      <View style={styles.infoContainer}>
        <Text style={[styles.cycleDayText, { color: '#FF1493' }]}>
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={[styles.phaseText, styles.textColor]}>
          {currentPhase === 'Phase data not available' && currentCycleDay === null
            ? 'Late for periods'
            : currentPhase === 'Loading...' || currentPhase === 'Error fetching phase'
            ? currentPhase
            : `${currentPhase} Phase`}
        </Text>
      </View>

      <View style={styles.phaseButtonContainer}>
        <View style={styles.logPeriodGroup}>
          <Text style={styles.labelText}>
            This marks today as the start of your menstruation and updates the plan accordingly
          </Text>
          <TouchableOpacity onPress={handleLogPeriod} style={[styles.logButton, styles.shadow]}>
            <Text style={styles.logButtonText}>Log Period</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleEditDataPress} style={[styles.editButton, styles.shadow]}>
          <Text style={styles.editButtonText}>Edit Data</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.myCyclesText, styles.textColor]}>My Cycles</Text>

      <TouchableOpacity onPress={handleHistoryPress} style={[styles.historyButton, styles.shadow]}>
        <Text style={styles.buttonText}>Period Calendar</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <MaterialIcons name="arrow-back" size={24} color="#FF69B4" />
                </TouchableOpacity>
                <Text style={styles.header}>Edit Cycle Data</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Period Date (YYYY-MM-DD)</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={lastPeriodDate}
                    onChangeText={setLastPeriodDate}
                    placeholder="e.g., 2025-05-01"
                    editable={false}
                  />
                  <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarIcon}>
                    <MaterialIcons name="calendar-today" size={24} color="#FF69B4" />
                  </TouchableOpacity>
                </View>
                <View style={{flex: '1', flexDirection: 'row'}}>
                  <Text style={styles.label}>Bleeding Days:</Text>
                  <TextInput
                    style={styles.input1}
                    value={bleedingDays || ''}
                    onChangeText={setBleedingDays}
                    keyboardType="numeric"
                    placeholder="2-7"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {showCalendar && (
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [lastPeriodDate]: { selected: true, marked: true, selectedColor: '#FF69B4' },
              }}
              theme={{
                selectedDayBackgroundColor: '#FF69B4',
                todayTextColor: '#FF69B4',
                arrowColor: '#FF69B4',
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer1}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.headerText}>Ovulation Tracker</Text>
        <Text style={styles.usernameText}>{user?.username || 'User'}</Text>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF1493" colors={['#FF1493']} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  headerContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF1297',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  infoContainer: {
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  cycleDayText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: 24,
    marginTop: 8,
    fontWeight: '600',
  },
  phaseButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  logPeriodGroup: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF69B4',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  labelText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '70%',
    minWidth: 180,
  },
  logButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '55%',
    minWidth: 180,
  },
  editButton: {
    backgroundColor: '#FF8C94',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '40%',
  },
  historyButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  myCyclesText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF1493',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  textColor: {
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    height: 300,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF1493',
    textAlign: 'center',
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  input1: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    marginTop: -9.5,
    marginLeft: 10,
  },
  dateInput: {
    flex: 1,
  },
  calendarIcon: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#FF69B4',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});