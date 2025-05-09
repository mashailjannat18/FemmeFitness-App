import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useUserAuth } from '@/context/UserAuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

const GoalSetting = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [initialGoal, setInitialGoal] = useState<string | null>(null);
  const router = useRouter();
  const { user, refreshUser } = useUserAuth();

  const goals = [
    {
      title: 'Lose Weight',
      description: 'Burn fat & get lean',
      icon: <Feather name="trending-down" size={28} color="#b03060" />,
    },
    {
      title: 'Gain Weight',
      description: 'Healthy weight increase',
      icon: <Feather name="trending-up" size={28} color="#b03060" />,
    },
    {
      title: 'Muscle Build',
      description: 'Build strength & power',
      icon: <MaterialIcons name="fitness-center" size={28} color="#b03060" />,
    },
    {
      title: 'Stay Fit',
      description: 'Maintain your wellness',
      icon: <MaterialIcons name="self-improvement" size={28} color="#b03060" />,
    },
  ];

  const scaleAnimations = goals.map(() => new Animated.Value(1));

  useEffect(() => {
    const fetchUserGoal = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('User')
        .select('goal')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user goal:', error);
        Alert.alert('Error', 'Failed to load your current goal.');
        return;
      }

      setSelectedGoal(data.goal);
      setInitialGoal(data.goal);
    };

    fetchUserGoal();
  }, [user]);

  const handlePress = (index: number, goal: string) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 0.96,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedGoal(goal);
  };

  const handleSave = async () => {
    if (!selectedGoal) {
      Alert.alert('Error', 'Please select a goal before saving.');
      return;
    }

    if (selectedGoal === initialGoal) {
      Alert.alert('Info', 'No changes made to your goal.');
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id, age, weight, height, goal, activity_level, preferred_rest_days, challenge_days, last_period_date, cycle_length, bleeding_days')
        .eq('id', user?.id)
        .single();

      if (userError || !userData) {
        throw new Error('Failed to fetch user data.');
      }

      const { data: workoutPlanData, error: workoutError } = await supabase
        .from('WorkoutPlans')
        .select('id, start_date')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (workoutError || !workoutPlanData) {
        throw new Error('No active workout plan found.');
      }

      const startDate = new Date(workoutPlanData.start_date);
      const currentDate = new Date();
      const daysElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (daysElapsed >= userData.challenge_days) {
        Alert.alert('Info', 'Your current challenge has ended. Please start a new challenge.');
        return;
      }

      const payload = {
        age: userData.age,
        activityLevel: userData.activity_level,
        goal: selectedGoal,
        weight: userData.weight,
        challengeDays: userData.challenge_days,
        preferredRestDay: userData.preferred_rest_days,
        height: userData.height,
        currentDay: daysElapsed,
        userId: userData.id,
        workoutPlanId: workoutPlanData.id,
      };

      const response = await fetch('http://192.168.1.8:5000/api/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update plans: ${errorText}`);
      }

      const result = await response.json();

      const { data, error: rpcError } = await supabase.rpc('update_user_and_workout_plan', {
        p_user_id: userData.id,
        p_weight: userData.weight,
        p_activity_level: userData.activity_level,
        p_challenge_days: userData.challenge_days,
        p_workout_plan: result.workout_plan,
        p_meal_plan: result.meal_plan,
        p_start_date: currentDate.toLocaleDateString().split('T')[0],
        p_intensity: result.intensity,
        p_goal: selectedGoal,
        p_last_period_date: userData.last_period_date,
        p_cycle_length: userData.cycle_length,
        p_bleeding_days: userData.bleeding_days,
      });

      if (rpcError) {
        console.error('Supabase RPC error:', rpcError);
        throw new Error(`Failed to update user and workout plan: ${rpcError.message}`);
      }

      await refreshUser();
      Alert.alert('Success', 'Your goal has been updated, and your plans have been regenerated.');
      setInitialGoal(selectedGoal);
    } catch (err: any) {
      console.error('Error updating goal and plans:', err.message);
      Alert.alert('Error', 'Failed to update your goal and plans.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('../(tabs)/Profile')}>
          <MaterialIcons name="arrow-back" size={24} color="#FF69B4" />
        </TouchableOpacity>
        <Text style={styles.header}>Goals Setting</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Current Goal</Text>
        <View style={styles.currentGoalContainer}>
          <Text style={styles.selectedGoal}>
            {selectedGoal || 'Not selected yet'}
          </Text>
        </View>

        <Text style={styles.subHeading}>Edit your goal</Text>
        <View style={styles.cardsContainer}>
          {goals.map((goal, index) => (
            <Animated.View
              key={goal.title}
              style={[styles.cardContainer, { transform: [{ scale: scaleAnimations[index] }] }]}
            >
              <TouchableOpacity
                style={[styles.card, selectedGoal === goal.title && styles.selectedCard]}
                onPress={() => handlePress(index, goal.title)}
                activeOpacity={0.85}
              >
                <View style={styles.iconCircle}>{goal.icon}</View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{goal.title}</Text>
                  <Text style={styles.cardDescription}>{goal.description}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 23,
    fontWeight: '700',
    color: '#FF1493',
    textAlign: 'center',
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF1493',
    marginBottom: 12,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginVertical: 20,
    textAlign: 'center',
  },
  currentGoalContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#d48fb0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffe0ea',
  },
  selectedGoal: {
    fontSize: 18,
    color: '#b03060',
    fontWeight: '500',
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cardContainer: {
    width: width * 0.9,
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#f3c0d6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ffe0ea',
  },
  selectedCard: {
    borderColor: '#b03060',
    borderWidth: 2,
    shadowColor: '#b03060',
    shadowOpacity: 0.4,
    elevation: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffe4ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    color: '#FF69B4',
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: width * 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalSetting;