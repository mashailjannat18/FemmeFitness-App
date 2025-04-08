// ExercisePlayback.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Exercise = {
  id: number;
  exercise_name: string;
  target_muscle: string;
  type: string;
  difficulty: string;
  caution: string | null;
  sets: number;
  reps: string;
  rest_time_sec: number;
  duration_min: number;
  calories_burned: number;
  description: string;
  workout_date: string;
};

const ExercisePlayback: React.FC = () => {
  const router = useRouter();
  const { exercises: exercisesParam } = useLocalSearchParams<{ exercises?: string }>();

  // Parse the exercises from the query parameter
  const exercises: Exercise[] = exercisesParam ? JSON.parse(exercisesParam) : [];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [countdown, setCountdown] = useState<number | null>(3); // 3, 2, 1 countdown
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);
  const [stopwatch, setStopwatch] = useState(0); // Stopwatch in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isNumericReps = currentExercise && !currentExercise.reps.includes('sec hold');
  const repsCount = isNumericReps ? parseInt(currentExercise?.reps, 10) : 0;
  const holdSeconds = !isNumericReps && currentExercise
    ? parseInt(currentExercise.reps.split(' ')[0], 10)
    : 0;

  // Handle the 3, 2, 1 countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsPlaying(true); // Start the exercise
    }
  }, [countdown]);

  // Handle the stopwatch
  useEffect(() => {
    let stopwatchTimer: NodeJS.Timeout | null = null;

    if (isPlaying) {
      stopwatchTimer = setInterval(() => {
        setStopwatch((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (stopwatchTimer) {
        clearInterval(stopwatchTimer);
      }
    };
  }, [isPlaying]);

  // Handle hold timer countdown
  useEffect(() => {
    if (isPlaying && !isNumericReps) {
      setHoldTimer(holdSeconds);
      setIsHolding(true);
    }

    if (holdTimer !== null && holdTimer > 0) {
      const timer = setInterval(() => {
        setHoldTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (holdTimer === 0) {
      setHoldTimer(null);
      setIsHolding(false);
      setIsPlaying(false); // Stop the stopwatch
      handleExerciseComplete();
    }
  }, [holdTimer, isPlaying, isNumericReps, holdSeconds]);

  // Handle rest timer countdown (now only between exercises)
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      const timer = setInterval(() => {
        setRestTimer((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (restTimer === 0) {
      setRestTimer(null);
      setIsResting(false);
      // Move to the next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCountdown(3); // Start countdown for the first set of the next exercise
      setStopwatch(0); // Reset stopwatch for the next exercise
      setIsPlaying(false); // Ensure stopwatch stops until the next countdown
    }
  }, [restTimer, currentExerciseIndex]);

  const handleDonePress = () => {
    if (!currentExercise) return;

    // Stop the stopwatch when the set is complete
    setIsPlaying(false);

    // Set is complete when "Done" is clicked
    if (currentSet < currentExercise.sets) {
      // Move to the next set with a countdown, no rest timer
      setCurrentSet(currentSet + 1);
      setStopwatch(0); // Reset stopwatch for the next set
      setCountdown(3); // Start countdown for the next set
    } else {
      // All sets are complete for this exercise
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    if (isLastExercise) {
      setIsFinished(true);
    } else {
      // Rest before the next exercise
      setIsResting(true);
      setRestTimer(currentExercise?.rest_time_sec || 0);
      setStopwatch(0); // Reset stopwatch for the next exercise
      setIsPlaying(false); // Ensure stopwatch stops until the next countdown
    }
  };

  const handleExitPlayback = () => {
    router.push('/(screens)/Exercises');
  };

  if (exercises.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No Exercises Available</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Workout Complete!</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No Exercises Available</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
          <Text style={styles.exitButtonText}>Return to Exercises</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{currentExercise.exercise_name}</Text>
      <Text style={styles.subHeader}>
        Set {currentSet} of {currentExercise.sets}
      </Text>
      {isNumericReps && (
        <Text style={styles.subHeader}>
          Total Reps: {repsCount}
        </Text>
      )}

      {countdown !== null ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Starting in {countdown}...</Text>
        </View>
      ) : isResting ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Rest for {restTimer} seconds</Text>
        </View>
      ) : isHolding ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Hold for {holdTimer} seconds</Text>
        </View>
      ) : (
        <>
          <View style={styles.stopwatchContainer}>
            <Text style={styles.stopwatchText}>
              Time: {Math.floor(stopwatch / 60)}:{(stopwatch % 60).toString().padStart(2, '0')}
            </Text>
          </View>
          {isNumericReps ? (
            <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Target: {currentExercise.target_muscle}</Text>
        <Text style={styles.detailText}>Type: {currentExercise.type}</Text>
        <Text style={styles.detailText}>Difficulty: {currentExercise.difficulty}</Text>
        <Text style={styles.detailText}>Description: {currentExercise.description}</Text>
      </View>

      <TouchableOpacity style={styles.exitButton} onPress={handleExitPlayback}>
        <Text style={styles.exitButtonText}>Exit Playback</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  timerContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#d63384',
    borderRadius: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  stopwatchContainer: {
    marginVertical: 10,
  },
  stopwatchText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginVertical: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  exitButton: {
    backgroundColor: '#d63384',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExercisePlayback;