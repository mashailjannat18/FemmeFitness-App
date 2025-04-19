import pandas as pd
import numpy as np
import json
from typing import Dict, List, Any
import os
import logging
from datetime import datetime, timedelta

# Set up logging
log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'logs')
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'models.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Construct the path to workouts.csv relative to the root directory (AIBackend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKOUTS_CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'workouts.csv')

# Global user variables
USER_AGE = None
USER_AGE_GROUP = None
USER_ACTIVITY_LEVEL = None
USER_REST_DAY = None
USER_PROGRAM_DURATION = None
USER_GOAL = None
USER_WEIGHT = None

# Constants
DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
GOAL_FOCUS_TEMPLATES = {
    'stay_fit': ['Upper Body Strength', 'Lower Body Strength', 'Light Endurance', 'Core + Abs', 'Light Endurance'],
    'gain_weight': ['Upper Body Strength', 'Core + Chest', 'Lower Body Strength', 'Light Endurance', 'Full Body Strength'],
    'weight_loss': ['Cardio', 'Full Body HIIT', 'Core + Lower Body', 'Full Body HIIT', 'Abs + Upper Body'],
    'build_muscle': ['Upper Body Strength', 'Lower Body Strength', 'Upper Body Strength', 'Core + Abs', 'Cardio']
}

MET_RANGES = {
    'low': (1.5, 3.9),
    'moderate': (4.0, 6.9),
    'high': (7.0, 12.3)
}

# Workout configurations
workout_config = {
    'adult': {
        'low': {
            'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
            'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5}
        },
        'moderate': {
            'weight_loss': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
            'stay_fit': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
            'build_muscle': {'exercises': 5, 'sets': 4, 'duration_per_exercise': 6},
            'gain_weight': {'exercises': 5, 'sets': 4, 'duration_per_exercise': 6}
        },
        'high': {
            'weight_loss': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
            'stay_fit': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
            'build_muscle': {'exercises': 6, 'sets': 4, 'duration_per_exercise': 7},
            'gain_weight': {'exercises': 6, 'sets': 4, 'duration_per_exercise': 7}
        }
    },
    'middle_aged': {
        'low': {
            'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'build_muscle': {'exercises': 3, 'sets': 3, 'duration_per_exercise': 5},
            'gain_weight': {'exercises': 3, 'sets': 3, 'duration_per_exercise': 5}
        },
        'moderate': {
            'weight_loss': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 5},
            'stay_fit': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 5},
            'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 6},
            'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 6}
        },
        'high': {
            'weight_loss': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 5},
            'stay_fit': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 5},
            'build_muscle': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
            'gain_weight': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6}
        }
    },
    'older_adult': {
        'low': {
            'weight_loss': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 3},
            'stay_fit': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 3},
            'build_muscle': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 4},
            'gain_weight': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 4}
        },
        'moderate': {
            'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
            'build_muscle': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 5},
            'gain_weight': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 5}
        },
        'high': {
            'weight_loss': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 4},
            'stay_fit': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 4},
            'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
            'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5}
        }
    }
}

goal_config = {
    'weight_loss': 15,
    'stay_fit': 15,
    'build_muscle': 10,
    'gain_weight': 8
}

rep_time_config = {
    'adult': {'low': 4, 'moderate': 4, 'high': 3},
    'middle_aged': {'low': 5, 'moderate': 5, 'high': 4},
    'older_adult': {'low': 6, 'moderate': 6, 'high': 5}
}

rest_time_config = {
    'adult': {'low': 45, 'moderate': 30, 'high': 20},
    'middle_aged': {'low': 60, 'moderate': 45, 'high': 30},
    'older_adult': {'low': 75, 'moderate': 60, 'high': 45}
}

focus_area_definitions = {
    'Upper Body Strength': {'target_muscles': ['Forearms', 'Shoulders', 'Biceps', 'Triceps', 'Chest'], 'Type': ['Strength']},
    'Lower Body Strength': {'target_muscles': ['Hamstrings', 'Glutes', 'Quadriceps', 'Calves', 'Abductors', 'Adductors'], 'Type': ['Strength']},
    'Core + Abs': {'target_muscles': ['Abdominals'], 'Type': ['Strength', 'Core']},
    'Core + Chest': {'target_muscles': ['Abdominals', 'Chest'], 'Type': ['Strength', 'Core']},
    'Light Endurance': {'target_muscles': ['Quadriceps', 'Calves', 'Glutes', 'Hamstrings'], 'Type': ['Cardio', 'Mobility']},
    'Full Body Strength': {'target_muscles': ['Full Body', 'Biceps', 'Triceps', 'Shoulders', 'Glutes', 'Hamstrings'], 'Type': ['Strength']},
    'Full Body HIIT': {'target_muscles': [], 'Type': [], 'Caution': ['HIIT', 'Plyometric HIIT', 'Isometric HIIT']},
    'Core + Lower Body': {'target_muscles': ['Abdominals', 'Hamstrings', 'Glutes', 'Quadriceps', 'Calves', 'Abductors', 'Adductors'], 'Type': ['Strength', 'Core']},
    'Abs + Upper Body': {'target_muscles': ['Abdominals', 'Shoulders', 'Biceps', 'Triceps', 'Middle Back', 'Lower Back'], 'Type': ['Strength']},
    'Cardio': {'target_muscles': [], 'Type': ['Cardio']},
    'Active Rest Day': {'target_muscles': [], 'Type': ['Mobility', 'Stretching']}
}

def map_age_to_group(age: int) -> str:
    logger.info(f"Mapping age {age} to age group")
    if age < 40:
        return 'adult'
    elif 40 <= age < 60:
        return 'middle_aged'
    return 'older_adult'

def convert_activity_level(slider_value: int) -> str:
    logger.info(f"Converting activity level slider value {slider_value}")
    if slider_value < 35:
        return 'low'
    elif slider_value < 70:
        return 'moderate'
    return 'high'

def load_user_profile(data: Dict[str, Any]) -> None:
    global USER_AGE, USER_AGE_GROUP, USER_ACTIVITY_LEVEL, USER_REST_DAY, USER_PROGRAM_DURATION, USER_GOAL, USER_WEIGHT
    try:
        logger.info("Loading user profile")
        USER_AGE = data['age']
        USER_ACTIVITY_LEVEL = convert_activity_level(data['activityLevel'])
        USER_REST_DAY = data['preferredRestDay']
        USER_PROGRAM_DURATION = data['challengeDays']
        USER_GOAL = data['goal']
        USER_WEIGHT = data['weight']
        USER_AGE_GROUP = map_age_to_group(USER_AGE)
        logger.info(f"User profile loaded: Age={USER_AGE}, ActivityLevel={USER_ACTIVITY_LEVEL}, Goal={USER_GOAL}")
    except KeyError as e:
        logger.error(f"Missing required field in user profile data: {e}")
        raise

def get_recommendations(age: int, activity: str) -> tuple[List[str], List[str]]:
    logger.info(f"Getting recommendations for age {age} and activity level {activity}")
    met_recs = []
    diff_recs = []

    if 15 <= age <= 34:
        if activity == 'low':
            met_recs.extend(['low'])
            diff_recs.extend(['Beginner', 'Intermediate'])
        elif activity == 'moderate':
            met_recs.extend(['low', 'moderate'])
            diff_recs.extend(['Beginner', 'Intermediate'])
        elif activity == 'high':
            met_recs.extend(['low', 'moderate', 'high'])
            diff_recs.extend(['Beginner', 'Intermediate'])
    elif 35 <= age <= 49:
        if activity != 'high':
            met_recs.append('low')
        else:
            met_recs.extend(['low', 'moderate'])
        diff_recs.append('Beginner')
        if activity in ['moderate', 'high']:
            diff_recs.append('Intermediate')
    else:
        if activity != 'high':
            met_recs.append('low')
        else:
            met_recs.extend(['low', 'moderate'])
        diff_recs.append('Beginner')

    logger.info(f"Recommendations: MET={met_recs}, Difficulty={diff_recs}")
    return met_recs, diff_recs

def filter_workouts(df: pd.DataFrame, met_recs: List[str], diff_recs: List[str]) -> pd.DataFrame:
    logger.info("Filtering workouts based on MET and difficulty recommendations")
    met_mask = pd.Series([False] * len(df))
    for met_level in met_recs:
        if met_level in MET_RANGES:
            min_val, max_val = MET_RANGES[met_level]
            met_mask |= df['MET Value'].between(min_val, max_val)
    diff_recs = [d.capitalize() for d in diff_recs]
    filtered_df = df[met_mask & df['Difficulty'].isin(diff_recs)]
    logger.info(f"Filtered workouts: {len(filtered_df)} entries")
    return filtered_df

def get_actual_date(day_index: int) -> tuple[str, str]:
    """Calculate the actual date and weekday starting from the current date."""
    start_date = datetime.now().date()
    actual_date = start_date + timedelta(days=day_index)
    weekday = actual_date.strftime('%A')
    date_str = actual_date.strftime('%B %d, %Y')
    return weekday, date_str

def generate_plan(goal: str, program_duration: int, preferred_rest_day: str) -> List[Dict[str, Any]]:
    logger.info(f"Generating workout plan for goal={goal}, duration={program_duration} days, rest day={preferred_rest_day}")
    plan = []
    focus_template = GOAL_FOCUS_TEMPLATES[goal]
    focus_day_counter = 0
    workout_streak = 0

    for i in range(program_duration):
        weekday, date_str = get_actual_date(i)
        focus = None
        if weekday == preferred_rest_day:
            focus = 'Complete Rest Day'
            workout_streak = 0
            logger.info(f"Day {i+1} ({weekday}, {date_str}): Set as Complete Rest Day due to preferred rest day")
        elif workout_streak >= 3:
            focus = 'Active Rest Day'
            workout_streak = 0
            logger.info(f"Day {i+1} ({weekday}, {date_str}): Set as Active Rest Day due to workout streak >= 3")
        else:
            focus = focus_template[focus_day_counter % len(focus_template)]
            focus_day_counter += 1
            workout_streak += 1
            logger.info(f"Day {i+1} ({weekday}, {date_str}): Assigned focus {focus}")
        plan.append({
            'Day': f'Day {i+1} ({weekday}, {date_str})',
            'Focus': focus,
            'Date': date_str
        })
    return plan

def calculate_calories_burned(met: float, duration_minutes: float, weight_kg: float) -> float:
    calories = (met * 3.5 * weight_kg / 200) * duration_minutes
    logger.debug(f"Calculating calories: MET={met}, Duration={duration_minutes} min, Weight={weight_kg} kg, Calories={calories}")
    return calories

def smart_get_workouts_for_focus(workouts_df: pd.DataFrame, focus_area: str, activity_level: str) -> List[Dict]:
    logger.info(f"Getting workouts for focus area {focus_area} and activity level {activity_level}")
    fallback_focus_map = {
        'Core + Lower Body': ['Lower Body Strength', 'Core + Abs', 'Lower Body Strength'],
        'Full Body HIIT': ['Light Endurance', 'Cardio'],
        'Core + Chest': ['Core + Abs', 'Upper Body Strength'],
        'Abs + Upper Body': ['Core + Abs', 'Upper Body Strength']
    }
    default_light_fallback = workouts_df[
        (workouts_df['Type'].isin(['Mobility', 'Stretching'])) &
        (workouts_df['Difficulty'] == 'Beginner')
    ]

    def filter_workouts(focus: str) -> pd.DataFrame:
        filters = focus_area_definitions.get(focus, {})
        if not filters:
            logger.warning(f"No filters defined for focus area {focus}")
            return pd.DataFrame()

        muscle_filter = workouts_df['Target Muscle'].isin(filters.get('target_muscles', [])) if filters.get('target_muscles') else True
        type_filter = workouts_df['Type'].isin(filters.get('Type', [])) if filters.get('Type') else True
        caution_filter = workouts_df['Caution'].isin(filters.get('Caution', [])) if filters.get('Caution') else True

        if isinstance(muscle_filter, bool):
            filtered = workouts_df[type_filter & caution_filter]
        elif isinstance(type_filter, bool):
            filtered = workouts_df[muscle_filter & caution_filter]
        elif isinstance(caution_filter, bool):
            filtered = workouts_df[muscle_filter & type_filter]
        else:
            filtered = workouts_df[muscle_filter & type_filter & caution_filter]

        if focus == 'Light Endurance':
            filtered = filtered[
                (filtered['Difficulty'].isin(['Beginner', 'Intermediate'])) &
                (filtered['MET Value'] <= 6)
            ]
        logger.debug(f"Filtered workouts for focus {focus}: {len(filtered)} entries")
        return filtered

    primary_workouts = filter_workouts(focus_area)
    if not primary_workouts.empty:
        logger.info(f"Found {len(primary_workouts)} primary workouts for focus {focus_area}")
        return primary_workouts.sort_values(by='MET Value').to_dict('records')

    fallback_focuses = fallback_focus_map.get(focus_area, [])
    for alt_focus in fallback_focuses:
        fallback_workouts = filter_workouts(alt_focus)
        if not fallback_workouts.empty:
            logger.info(f"Found {len(fallback_workouts)} fallback workouts for focus {alt_focus}")
            return fallback_workouts.sort_values(by='MET Value').to_dict('records')

    if activity_level.lower() == 'low':
        relaxed = workouts_df[
            (workouts_df['Difficulty'].isin(['Beginner', 'Intermediate'])) &
            (workouts_df['MET Value'] <= 6)
        ]
        if not relaxed.empty:
            logger.info(f"Found {len(relaxed)} relaxed workouts for low activity level")
            return relaxed.sort_values(by='MET Value').to_dict('records')

    if not default_light_fallback.empty:
        logger.info(f"Using {len(default_light_fallback)} default light fallback workouts")
        return default_light_fallback.sort_values(by='MET Value').to_dict('records')

    logger.warning(f"No workouts found for focus {focus_area} and activity level {activity_level}")
    return []

def clean_workout_data(workout: Dict) -> Dict:
    logger.debug("Cleaning workout data")
    cleaned_workout = {}
    for key, value in workout.items():
        if isinstance(value, float) and np.isnan(value):
            cleaned_workout[key] = None
        elif isinstance(value, str) and value.lower() in ['nan', '']:
            cleaned_workout[key] = None
        else:
            cleaned_workout[key] = value
    return cleaned_workout

def generate_workout_plan(data: Dict[str, Any]) -> List[Dict]:
    global USER_AGE_GROUP, USER_ACTIVITY_LEVEL, USER_GOAL, USER_WEIGHT
    try:
        logger.info("Starting workout plan generation")
        load_user_profile(data)

        # Load and clean workouts data
        logger.info(f"Loading workouts CSV from {WORKOUTS_CSV_PATH}")
        workouts_df = pd.read_csv(WORKOUTS_CSV_PATH)
        logger.info("Replacing NaN values in workouts DataFrame")
        workouts_df = workouts_df.replace({np.nan: None})
        workouts_df['Difficulty'] = workouts_df['Difficulty'].str.strip().str.capitalize()
        logger.info(f"Loaded {len(workouts_df)} workout entries")

        # Filter workouts based on user profile
        met_recs, diff_recs = get_recommendations(USER_AGE, USER_ACTIVITY_LEVEL)
        filtered_df = filter_workouts(workouts_df, met_recs, diff_recs)

        # Generate plan
        plan = generate_plan(USER_GOAL, USER_PROGRAM_DURATION, USER_REST_DAY)
        plan_df = pd.DataFrame(plan)
        logger.info(f"Generated initial plan with {len(plan)} days")

        # Configure workout parameters
        config = workout_config[USER_AGE_GROUP][USER_ACTIVITY_LEVEL][USER_GOAL]
        num_exercises = config['exercises']
        sets = config['sets']
        reps = goal_config[USER_GOAL]
        rep_time = rep_time_config[USER_AGE_GROUP][USER_ACTIVITY_LEVEL]
        rest_time = rest_time_config[USER_AGE_GROUP][USER_ACTIVITY_LEVEL]
        logger.info(f"Workout parameters: Exercises={num_exercises}, Sets={sets}, Reps={reps}, RepTime={rep_time}, RestTime={rest_time}")

        # Generate final populated plan
        final_plan = []
        focus_index_tracker = {}

        for _, row in plan_df.iterrows():
            day_data = dict(row)
            focus = row['Focus']
            day_data['Workouts'] = []
            total_duration = 0
            total_calories = 0

            if focus == 'Complete Rest Day':
                logger.info(f"{day_data['Day']}: Complete Rest Day, no workouts assigned")
                day_data['Total Duration (min)'] = 0
                day_data['Total Calories Burned'] = 0
            elif focus == 'Active Rest Day':
                logger.info(f"{day_data['Day']}: Active Rest Day, assigning Mobility/Stretching exercises")
                pool = smart_get_workouts_for_focus(filtered_df, focus, USER_ACTIVITY_LEVEL)
                selected = pd.DataFrame(pool).sample(n=3, replace=True).to_dict('records')
                for w in selected:
                    w = clean_workout_data(w)
                    met = w.get('MET Value', 2.5) or 2.5
                    duration_min = 0.5  # 30 seconds per exercise
                    calories = calculate_calories_burned(met, duration_min, USER_WEIGHT)
                    w['Sets'] = 1
                    w['Reps'] = 'None'
                    w['Rest Time (sec)'] = rest_time
                    w['Duration (min)'] = duration_min
                    w['Calories Burned'] = round(calories, 2)
                    total_duration += duration_min
                    total_calories += calories
                    day_data['Workouts'].append(w)
                    logger.debug(f"Added Active Rest workout: {w.get('Name')}")
                day_data['Total Duration (min)'] = round(total_duration, 2)
                day_data['Total Calories Burned'] = round(total_calories, 2)
            else:
                logger.info(f"Generating workouts for focus {focus} on {day_data['Day']}")
                pool = smart_get_workouts_for_focus(filtered_df, focus, USER_ACTIVITY_LEVEL)
                start = focus_index_tracker.get(focus, 0)
                end = start + num_exercises
                selected = pool[start:end]

                if len(selected) < num_exercises:
                    selected += pool[:num_exercises - len(selected)]
                focus_index_tracker[focus] = end % len(pool)

                for w in selected:
                    w = clean_workout_data(w)
                    met = w.get('MET Value', 3) or 3
                    if w.get('Caution') == 'Isometric Hold':
                        duration_min = 0.5
                        exercise_sets = 1
                        exercise_reps = 'None'
                        exercise_rest_time = rest_time
                    else:
                        total_seconds = (sets * reps * rep_time) + ((sets - 1) * rest_time)
                        duration_min = total_seconds / 60
                        exercise_sets = sets
                        exercise_reps = reps
                        exercise_rest_time = rest_time
                    calories = calculate_calories_burned(met, duration_min, USER_WEIGHT)
                    w['Sets'] = exercise_sets
                    w['Reps'] = exercise_reps
                    w['Rest Time (sec)'] = exercise_rest_time
                    w['Duration (min)'] = round(duration_min, 2)
                    w['Calories Burned'] = round(calories, 2)
                    total_duration += duration_min
                    total_calories += calories
                    day_data['Workouts'].append(w)
                    logger.debug(f"Added workout: {w.get('Name')}")
                day_data['Total Duration (min)'] = round(total_duration, 2)
                day_data['Total Calories Burned'] = round(total_calories, 2)

            final_plan.append(day_data)

        logger.info("Workout plan generation completed")
        return final_plan

    except Exception as e:
        logger.error(f"Error generating workout plan: {str(e)}")
        raise