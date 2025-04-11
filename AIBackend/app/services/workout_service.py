import pandas as pd
import random
import logging
import math
import json
from datetime import datetime, timedelta
from app.config import Config
from app.utils.helpers import calculate_calories_burned, map_age_to_group, convert_activity_level
from app.services.meal_service import MealService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkoutService:
    def __init__(self):
        self.workouts_df = pd.read_csv(Config.WORKOUTS_CSV_PATH)
        self.workouts_df['Difficulty'] = self.workouts_df['Difficulty'].str.strip().str.capitalize()
        if 'Name' not in self.workouts_df.columns:
            logger.error("Column 'Name' not found in workouts CSV. Available columns: %s", self.workouts_df.columns)
            raise ValueError("Column 'Name' not found in workouts CSV")
        self.meal_service = MealService()
        logger.info("Loaded workouts CSV with %d entries", len(self.workouts_df))

        self.workout_config = {
            'adult': {
                'low': {
                    'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                    'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                },
                'moderate': {
                    'weight_loss': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                    'stay_fit': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                    'build_muscle': {'exercises': 5, 'sets': 4, 'duration_per_exercise': 6},
                    'gain_weight': {'exercises': 5, 'sets': 4, 'duration_per_exercise': 6},
                },
                'high': {
                    'weight_loss': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
                    'stay_fit': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
                    'build_muscle': {'exercises': 6, 'sets': 4, 'duration_per_exercise': 7},
                    'gain_weight': {'exercises': 6, 'sets': 4, 'duration_per_exercise': 7},
                }
            },
            'middle_aged': {
                'low': {
                    'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'build_muscle': {'exercises': 3, 'sets': 3, 'duration_per_exercise': 5},
                    'gain_weight': {'exercises': 3, 'sets': 3, 'duration_per_exercise': 5},
                },
                'moderate': {
                    'weight_loss': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 5},
                    'stay_fit': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 5},
                    'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 6},
                    'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 6},
                },
                'high': {
                    'weight_loss': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 5},
                    'stay_fit': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 5},
                    'build_muscle': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
                    'gain_weight': {'exercises': 5, 'sets': 3, 'duration_per_exercise': 6},
                }
            },
            'older_adult': {
                'low': {
                    'weight_loss': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 3},
                    'stay_fit': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 3},
                    'build_muscle': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 4},
                    'gain_weight': {'exercises': 2, 'sets': 2, 'duration_per_exercise': 4},
                },
                'moderate': {
                    'weight_loss': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'stay_fit': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 4},
                    'build_muscle': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 5},
                    'gain_weight': {'exercises': 3, 'sets': 2, 'duration_per_exercise': 5},
                },
                'high': {
                    'weight_loss': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 4},
                    'stay_fit': {'exercises': 4, 'sets': 2, 'duration_per_exercise': 4},
                    'build_muscle': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                    'gain_weight': {'exercises': 4, 'sets': 3, 'duration_per_exercise': 5},
                }
            }
        }

        self.goal_config = {
            'weight_loss': 15,
            'stay_fit': 15,
            'build_muscle': 10,
            'gain_weight': 8
        }

        self.rep_time_config = {
            'adult': {'low': 4, 'moderate': 4, 'high': 3},
            'middle_aged': {'low': 5, 'moderate': 5, 'high': 4},
            'older_adult': {'low': 6, 'moderate': 6, 'high': 5}
        }

        self.rest_time_config = {
            'adult': {'low': 45, 'moderate': 30, 'high': 20},
            'middle_aged': {'low': 60, 'moderate': 45, 'high': 30},
            'older_adult': {'low': 75, 'moderate': 60, 'high': 45}
        }

        self.goal_focus_templates = {
            'stay_fit': ['Upper Body Strength', 'Lower Body Strength', 'Core + Abs', 'Light Endurance', 'Light Endurance'],
            'gain_weight': ['Upper Body Strength', 'Core + Chest', 'Lower Body Strength', 'Light Endurance', 'Full Body Strength'],
            'weight_loss': ['Cardio', 'Full Body HIIT', 'Core + Lower Body', 'Full Body HIIT', 'Abs + Upper Body'],
            'build_muscle': ['Upper Body Strength', 'Lower Body Strength', 'Upper Body Strength', 'Core + Abs', 'Cardio']
        }

        self.focus_area_definitions = {
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

    def get_recommendations(self, age, activity_level):
        met_recommendations = {
            'adult': {'low': (1.5, 3.9), 'moderate': (4.0, 6.9), 'high': (7.0, 10.0)},
            'middle_aged': {'low': (1.5, 3.9), 'moderate': (4.0, 6.9), 'high': (7.0, 10.0)},
            'older_adult': {'low': (1.5, 3.9), 'moderate': (4.0, 6.9), 'high': (7.0, 10.0)}
        }
        difficulty_recommendations = {
            'adult': {
                'low': ['Beginner'],
                'moderate': ['Beginner', 'Intermediate'],
                'high': ['Intermediate', 'Advanced']
            },
            'middle_aged': {
                'low': ['Beginner'],
                'moderate': ['Beginner', 'Intermediate'],
                'high': ['Intermediate']
            },
            'older_adult': {
                'low': ['Beginner'],
                'moderate': ['Beginner'],
                'high': ['Beginner', 'Intermediate']
            }
        }
        
        age_group = map_age_to_group(age)
        met_range = met_recommendations[age_group][activity_level]
        difficulty = difficulty_recommendations[age_group][activity_level]
        return met_range, difficulty

    def filter_workouts(self, met_range, difficulty):
        return self.workouts_df[
            (self.workouts_df['MET Value'].between(met_range[0], met_range[1])) &
            (self.workouts_df['Difficulty'].isin(difficulty))
        ]

    def smart_get_workouts_for_focus(self, focus_area, activity_level, filtered_df):
        fallback_focus_map = {
            'Core + Lower Body': ['Lower Body Strength', 'Core + Abs'],
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

            muscle_filter = filtered_df['Target Muscle'].isin(filters.get('target_muscles', [])) if filters.get('target_muscles') else pd.Series([True] * len(filtered_df))
            type_filter = filtered_df['Type'].isin(filters.get('Type', [])) if filters.get('Type') else pd.Series([True] * len(filtered_df))
            caution_filter = filtered_df['Caution'].isin(filters.get('Caution', [])) if filters.get('Caution') else pd.Series([True] * len(filtered_df))

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

    def generate_plan(self, goal, program_duration, preferred_rest_day):
        start_date = datetime.now();
        focus_template = self.goal_focus_templates[goal]
        total_days = program_duration
        full_plan = []
        workout_streak = 0
        focus_index = 0

        preferred_rest_day = preferred_rest_day.capitalize()
        logger.info("Preferred rest day received: %s", preferred_rest_day)

        for i in range(total_days):
            current_date = start_date + timedelta(days=i)
            weekday = current_date.strftime('%A')

            if weekday == preferred_rest_day:
                focus = 'Complete Rest Day'
                workout_streak = 0
                logger.debug("Day %d (%s): Assigned Complete Rest Day", i + 1, weekday)
            elif workout_streak >= 3:
                focus = 'Active Rest Day'
                workout_streak = 0
                logger.debug("Day %d (%s): Assigned Active Rest Day (streak reset)", i + 1, weekday)
            else:
                focus = focus_template[focus_index % len(focus_template)]
                focus_index += 1
                workout_streak += 1
                logger.debug("Day %d (%s): Assigned %s (streak: %d)", i + 1, weekday, focus, workout_streak)

            full_plan.append({
                'Day': f"Day {i + 1} ({weekday})",
                'Focus': focus
            })

        return full_plan

    def clean_nan(self, plan):
        def clean_dict(d):
            if isinstance(d, dict):
                return {k: clean_dict(v) for k, v in d.items() if not (isinstance(v, float) and math.isnan(v))}
            elif isinstance(d, list):
                return [clean_dict(item) for item in d]
            elif isinstance(d, float) and math.isnan(d):
                return None
            return d
        return clean_dict(plan)

    def generate_workout_plan(self, user_data):
        age = user_data.get('age')
        activity_level = convert_activity_level(user_data.get('activityLevel', 50))
        goal = user_data.get('goal')
        weight = user_data.get('weight')
        program_duration = user_data.get('challengeDays', 60)
        preferred_rest_day = user_data.get('preferredRestDay')

        logger.info("Generating workout plan for user: age=%d, activity=%s, goal=%s, weight=%d, duration=%d, rest_day=%s",
                    age, activity_level, goal, weight, program_duration, preferred_rest_day)

        if not preferred_rest_day:
            raise ValueError("Preferred rest day must be specified.")

        age_group = map_age_to_group(age)
        met_recs, diff_recs = self.get_recommendations(age, activity_level)
        filtered_df = self.filter_workouts(met_recs, diff_recs)
        weekly_plan = self.generate_plan(goal, program_duration, preferred_rest_day)

        config = self.workout_config[age_group][activity_level][goal]
        num_exercises = config['exercises']
        sets = config['sets']
        reps = self.goal_config[goal]
        rep_time = self.rep_time_config[age_group][activity_level]
        rest_time = self.rest_time_config[age_group][activity_level]

        final_plan = []
        focus_index_tracker = {}

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
                        duration_min = 30 / 60
                        calories = calculate_calories_burned(w.get('MET Value', 2.5), duration_min, weight)
                        exercise_name = w.get('Name', 'Unknown Exercise')

                        w['Sets'] = 1
                        w['Reps'] = '30 sec hold'
                        w['Rest Time (sec)'] = 30
                        w['Duration (min)'] = duration_min
                        w['Calories Burned'] = round(calories, 2)
                        w['Description'] = w.get('Description', 'No description available')
                        w['Name'] = exercise_name

                        total_duration += duration_min
                        total_calories += calories
                        day_data['Workouts'].append(w)

                    day_data['Total Duration (min)'] = round(total_duration, 2)
                    day_data['Total Calories Burned'] = round(total_calories, 2)
                else:  # Complete Rest Day
                    day_data['Total Duration (min)'] = 0
                    day_data['Total Calories Burned'] = 0
            else:
                pool = self.smart_get_workouts_for_focus(focus, activity_level, filtered_df)
                if not pool:
                    logger.warning("No workouts available for focus %s on %s", focus, day_data['Day'])
                    day_data['Total Duration (min)'] = 0
                    day_data['Total Calories Burned'] = 0
                else:
                    start = focus_index_tracker.get(focus, 0)
                    end = start + num_exercises
                    selected = pool[start:end]
                    if len(selected) < num_exercises:
                        selected += pool[:num_exercises - len(selected)]
                    focus_index_tracker[focus] = end % len(pool)

                    for w in selected:
                        met = w.get('MET Value', 3)
                        total_seconds = (sets * reps * rep_time) + ((sets - 1) * rest_time)
                        duration_min = total_seconds / 60
                        calories = calculate_calories_burned(met, duration_min, weight)
                        exercise_name = w.get('Name', 'Unknown Exercise')

                        w['Sets'] = sets
                        w['Reps'] = reps
                        w['Rest Time (sec)'] = rest_time
                        w['Duration (min)'] = round(duration_min, 2)
                        w['Calories Burned'] = round(calories, 2)
                        w['Description'] = w.get('Description', 'No description available')
                        w['Name'] = exercise_name

                        total_duration += duration_min
                        total_calories += calories
                        day_data['Workouts'].append(w)

                    day_data['Total Duration (min)'] = round(total_duration, 2)
                    day_data['Total Calories Burned'] = round(total_calories, 2)

            final_plan.append(day_data)

        logger.info("Generated final plan with %d days", len(final_plan))
        meal_plan = self.meal_service.generate_meal_plan(final_plan, user_data)

        return {
            "workout_plan": self.clean_nan(final_plan),
            "meal_plan": meal_plan
        }