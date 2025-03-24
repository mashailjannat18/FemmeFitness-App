import pandas as pd
from app.config import Config
from app.utils.helpers import calculate_calories_burned, map_age_to_group, convert_activity_level
import math

class WorkoutService:
    def __init__(self):
        self.workouts_df = pd.read_csv(Config.WORKOUTS_CSV_PATH)
        self.workouts_df['Difficulty'] = self.workouts_df['Difficulty'].str.strip().str.capitalize()

    # Constants
    DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    GOAL_FOCUS_TEMPLATES = {
        'stay_fit': ['Upper Body Strength', 'Lower Body Strength', 'Core + Abs', 'Light Endurance', 'Light Endurance'],
        'gain_weight': ['Upper Body Strength', 'Core + Chest', 'Lower Body Strength', 'Light Endurance', 'Full Body Strength'],
        'weight_loss': ['Cardio', 'Full Body HIIT', 'Core + Lower Body', 'Full Body HIIT', 'Abs + Upper Body'],
        'build_muscle': ['Upper Body Strength', 'Lower Body Strength', 'Upper Body Strength', 'Core + Abs', 'Cardio']
    }

    # MET Ranges for filtering
    MET_RANGES = {
        'low': (1.5, 3.9),
        'moderate': (4.0, 6.9),
        'high': (7.0, 10.0)
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

    # Reps per goal
    goal_config = {
        'weight_loss': 15,
        'stay_fit': 15,
        'build_muscle': 10,
        'gain_weight': 8
    }

    # Seconds per rep based on age and activity
    rep_time_config = {
        'adult': {'low': 4, 'moderate': 4, 'high': 3},
        'middle_aged': {'low': 5, 'moderate': 5, 'high': 4},
        'older_adult': {'low': 6, 'moderate': 6, 'high': 5}
    }

    # Rest time between sets (in seconds)
    rest_time_config = {
        'adult': {'low': 45, 'moderate': 30, 'high': 20},
        'middle_aged': {'low': 60, 'moderate': 45, 'high': 30},
        'older_adult': {'low': 75, 'moderate': 60, 'high': 45}
    }

    # Focus area definitions
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

    def get_recommendations(self, age, activity):
        # Age group ranges
        min_ranges = {'adult': 15, 'middle_aged': 35, 'older_adult': 50}
        max_ranges = {'adult': 34, 'middle_aged': 49, 'older_adult': 120}

        met_recs = []
        diff_recs = []

        # Adults (15-34)
        if min_ranges['adult'] <= age <= max_ranges['adult']:
            if activity == 'low':
                met_recs.extend(['low'])
                diff_recs.extend(['Beginner', 'Intermediate'])
            elif activity == 'moderate':
                met_recs.extend(['low', 'moderate'])
                diff_recs.extend(['Beginner', 'Intermediate'])
            elif activity == 'high':
                met_recs.extend(['low', 'moderate', 'high'])
                diff_recs.extend(['Beginner', 'Intermediate'])
        
        # Middle-aged (35-49)
        elif min_ranges['middle_aged'] <= age <= max_ranges['middle_aged']:
            if activity != 'high':
                met_recs.extend(['low'])
            else:
                met_recs.extend(['low', 'moderate'])
            diff_recs.extend(['Beginner'])
            if activity in ['moderate', 'high']:
                diff_recs.extend(['Intermediate'])
        
        # Older adults (50+)
        elif age >= min_ranges['older_adult']:
            if activity != 'high':
                met_recs.extend(['low'])
            else:
                met_recs.extend(['low', 'moderate'])
            diff_recs.extend(['Beginner'])

        return met_recs, diff_recs

    def filter_workouts(self, met_recs, diff_recs):
        met_mask = pd.Series([False] * len(self.workouts_df))
        for met_level in met_recs:
            if met_level in self.MET_RANGES:
                min_val, max_val = self.MET_RANGES[met_level]
                met_mask |= self.workouts_df['MET Value'].between(min_val, max_val)

        filtered_df = self.workouts_df[met_mask & self.workouts_df['Difficulty'].isin(diff_recs)]
        return filtered_df

    def get_weekday(self, day_index):
        return self.DAYS_OF_WEEK[day_index % 7]

    def get_next_focus(self, template_list, day_number):
        return template_list[day_number % len(template_list)]

    def generate_plan(self, goal, program_duration, preferred_rest_day):
        plan = []
        focus_template = self.GOAL_FOCUS_TEMPLATES[goal]
        focus_day_counter = 0
        workout_streak = 0

        for i in range(program_duration):
            weekday = self.get_weekday(i)
            if weekday == preferred_rest_day:
                focus = 'Complete Rest Day'
                workout_streak = 0
            elif workout_streak >= 3:
                focus = 'Active Rest Day'
                workout_streak = 0
            else:
                focus = self.get_next_focus(focus_template, focus_day_counter)
                focus_day_counter += 1
                workout_streak += 1

            plan.append({'Day': f'Day {i+1} ({weekday})', 'Focus': focus})
        return plan

    def smart_get_workouts_for_focus(self, focus_area, activity_level, filtered_df):
        fallback_focus_map = {
            'Core + Lower Body Strength': ['Lower Body Strength', 'Core + Abs', 'Lower Body Strength'],
            'Full Body HIIT': ['Light Endurance', 'Cardio'],
            'Core + Chest': ['Core + Abs', 'Upper Body Strength'],
            'Abs + Upper Body': ['Core + Abs', 'Upper Body Strength'],
        }

        default_light_fallback = filtered_df[
            (filtered_df['Type'].isin(['Mobility', 'Stretching'])) &
            (filtered_df['Difficulty'] == 'Beginner')
        ]

        def filter_workouts(focus):
            filters = self.focus_area_definitions.get(focus, {})
            if not filters:
                return []

            muscle_filter = filtered_df['Target Muscle'].isin(filters.get('target_muscles', [])) if filters.get('target_muscles') else True
            type_filter = filtered_df['Type'].isin(filters.get('Type', [])) if filters.get('Type') else True
            caution_filter = filtered_df['Caution'].isin(filters.get('Caution', [])) if filters.get('Caution') else True

            if isinstance(muscle_filter, bool):
                filtered = filtered_df[type_filter & caution_filter]
            elif isinstance(type_filter, bool):
                filtered = filtered_df[muscle_filter & caution_filter]
            elif isinstance(caution_filter, bool):
                filtered = filtered_df[muscle_filter & type_filter]
            else:
                filtered = filtered_df[muscle_filter & type_filter & caution_filter]

            if focus == 'Light Endurance':
                filtered = filtered[
                    (filtered['Difficulty'].isin(['Beginner', 'Intermediate'])) &
                    (filtered['MET Value'] <= 6)
                ]
            return filtered

        primary_workouts = filter_workouts(focus_area)
        if not primary_workouts.empty:
            return primary_workouts.sort_values(by='MET Value').to_dict('records')

        fallback_focuses = fallback_focus_map.get(focus_area, [])
        for alt_focus in fallback_focuses:
            fallback_workouts = filter_workouts(alt_focus)
            if not fallback_workouts.empty:
                return fallback_workouts.sort_values(by='MET Value').to_dict('records')

        if activity_level.lower() == 'low':
            relaxed = filtered_df[
                (filtered_df['Difficulty'].isin(['Beginner', 'Intermediate'])) &
                (filtered_df['MET Value'] <= 6)
            ]
            if not relaxed.empty:
                return relaxed.sort_values(by='MET Value').to_dict('records')

        if not default_light_fallback.empty:
            return default_light_fallback.sort_values(by='MET Value').to_dict('records')

        return []

    def clean_nan(self, data):
        """Recursively replace NaN with null in a dictionary or list."""
        if isinstance(data, dict):
            return {k: self.clean_nan(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.clean_nan(item) for item in data]
        elif isinstance(data, float) and math.isnan(data):
            return None
        return data

    def generate_workout_plan(self, user_data):
        age = user_data.get('age')
        activity_level = convert_activity_level(user_data.get('activityLevel', 50))
        goal = user_data.get('goal')
        weight = user_data.get('weight')
        program_duration = user_data.get('challengeDays', 60)
        preferred_rest_day = user_data.get('preferredRestDay', 'Sunday')

        # Map user data
        age_group = map_age_to_group(age)
        
        # Get MET and difficulty recommendations
        met_recs, diff_recs = self.get_recommendations(age, activity_level)
        filtered_df = self.filter_workouts(met_recs, diff_recs)

        # Generate weekly plan
        weekly_plan = self.generate_plan(goal, program_duration, preferred_rest_day)

        # Get workout configuration
        config = self.workout_config[age_group][activity_level][goal]
        num_exercises = config['exercises']
        sets = config['sets']
        reps = self.goal_config[goal]
        rep_time = self.rep_time_config[age_group][activity_level]
        rest_time = self.rest_time_config[age_group][activity_level]

        # Generate final plan
        focus_index_tracker = {}
        final_plan = []

        for day_plan in weekly_plan:
            day_data = day_plan.copy()
            focus = day_plan['Focus']
            day_data['Workouts'] = []
            total_duration = 0
            total_calories = 0

            if 'Rest' in focus:
                if focus == 'Active Rest Day':
                    rest_exercises = filtered_df[
                        filtered_df['Type'].isin(['Mobility', 'Stretching'])
                    ].sample(n=3, replace=True).to_dict('records')

                    for w in rest_exercises:
                        duration_min = 30 / 60  # 30 secs per stretch
                        calories = calculate_calories_burned(w.get('MET Value', 2.5), duration_min, weight)

                        w['Sets'] = 1
                        w['Reps'] = '30 sec hold'
                        w['Rest Time (sec)'] = 30
                        w['Duration (min)'] = duration_min
                        w['Calories Burned'] = round(calories, 2)
                        w['Description'] = w.get('Description', 'No description available')  # Include description

                        total_duration += duration_min
                        total_calories += calories
                        day_data['Workouts'].append(w)

                    day_data['Total Duration (min)'] = round(total_duration, 2)
                    day_data['Total Calories Burned'] = round(total_calories, 2)
                else:
                    day_data['Total Duration (min)'] = 0
                    day_data['Total Calories Burned'] = 0
            else:
                pool = self.smart_get_workouts_for_focus(focus, activity_level, filtered_df)
                start = focus_index_tracker.get(focus, 0)
                end = start + num_exercises
                selected = pool[start:end]

                if len(selected) < num_exercises and pool:
                    selected += pool[:num_exercises - len(selected)]
                focus_index_tracker[focus] = end % len(pool) if pool else 0

                for w in selected:
                    met = w.get('MET Value', 3)
                    total_seconds = (sets * reps * rep_time) + ((sets - 1) * rest_time)
                    duration_min = total_seconds / 60
                    calories = calculate_calories_burned(met, duration_min, weight)

                    w['Sets'] = sets
                    w['Reps'] = reps
                    w['Rest Time (sec)'] = rest_time
                    w['Duration (min)'] = round(duration_min, 2)
                    w['Calories Burned'] = round(calories, 2)
                    w['Description'] = w.get('Description', 'No description available')  # Include description

                    total_duration += duration_min
                    total_calories += calories
                    day_data['Workouts'].append(w)

                day_data['Total Duration (min)'] = round(total_duration, 2)
                day_data['Total Calories Burned'] = round(total_calories, 2)

            final_plan.append(day_data)

        # Clean NaN values before returning
        return self.clean_nan(final_plan)