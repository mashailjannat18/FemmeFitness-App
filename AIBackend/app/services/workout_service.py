# app/services/workout_service.py
import pandas as pd
import random
import logging
from app.config import Config
from app.utils.helpers import calculate_calories_burned, map_age_to_group, convert_activity_level
from app.services.meal_service import MealService
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkoutService:
    def __init__(self):
        # Load the workouts CSV
        self.workouts_df = pd.read_csv(Config.WORKOUTS_CSV_PATH)
        # Clean the Difficulty column
        self.workouts_df['Difficulty'] = self.workouts_df['Difficulty'].str.strip().str.capitalize()
        # Ensure 'Name' column exists (changed from 'Exercise Name')
        if 'Name' not in self.workouts_df.columns:
            logger.error("Column 'Name' not found in workouts CSV. Available columns: %s", self.workouts_df.columns)
            raise ValueError("Column 'Name' not found in workouts CSV")
        self.meal_service = MealService()
        logger.info("Loaded workouts CSV with %d entries", len(self.workouts_df))

        # Configuration for workout plans
        self.workout_config = {
            'adult': {
                'low': {
                    'weight_loss': {'exercises': 3, 'sets': 2},
                    'build_muscle': {'exercises': 4, 'sets': 3},
                    'stay_fit': {'exercises': 3, 'sets': 2},
                    'gain_weight': {'exercises': 4, 'sets': 3}
                },
                'moderate': {
                    'weight_loss': {'exercises': 4, 'sets': 3},
                    'build_muscle': {'exercises': 5, 'sets': 4},
                    'stay_fit': {'exercises': 4, 'sets': 3},
                    'gain_weight': {'exercises': 5, 'sets': 4}
                },
                'high': {
                    'weight_loss': {'exercises': 5, 'sets': 3},
                    'build_muscle': {'exercises': 6, 'sets': 4},
                    'stay_fit': {'exercises': 5, 'sets': 3},
                    'gain_weight': {'exercises': 6, 'sets': 4}
                }
            },
            'middle_aged': {
                'low': {
                    'weight_loss': {'exercises': 3, 'sets': 2},
                    'build_muscle': {'exercises': 3, 'sets': 3},
                    'stay_fit': {'exercises': 3, 'sets': 2},
                    'gain_weight': {'exercises': 3, 'sets': 3}
                },
                'moderate': {
                    'weight_loss': {'exercises': 4, 'sets': 2},
                    'build_muscle': {'exercises': 4, 'sets': 3},
                    'stay_fit': {'exercises': 4, 'sets': 2},
                    'gain_weight': {'exercises': 4, 'sets': 3}
                },
                'high': {
                    'weight_loss': {'exercises': 4, 'sets': 3},
                    'build_muscle': {'exercises': 5, 'sets': 3},
                    'stay_fit': {'exercises': 4, 'sets': 3},
                    'gain_weight': {'exercises': 5, 'sets': 3}
                }
            },
            'older_adult': {
                'low': {
                    'weight_loss': {'exercises': 2, 'sets': 2},
                    'build_muscle': {'exercises': 3, 'sets': 2},
                    'stay_fit': {'exercises': 2, 'sets': 2},
                    'gain_weight': {'exercises': 3, 'sets': 2}
                },
                'moderate': {
                    'weight_loss': {'exercises': 3, 'sets': 2},
                    'build_muscle': {'exercises': 3, 'sets': 2},
                    'stay_fit': {'exercises': 3, 'sets': 2},
                    'gain_weight': {'exercises': 3, 'sets': 2}
                },
                'high': {
                    'weight_loss': {'exercises': 3, 'sets': 2},
                    'build_muscle': {'exercises': 4, 'sets': 3},
                    'stay_fit': {'exercises': 3, 'sets': 2},
                    'gain_weight': {'exercises': 4, 'sets': 3}
                }
            }
        }

        self.goal_config = {
            'weight_loss': 12,
            'build_muscle': 10,
            'stay_fit': 12,
            'gain_weight': 10
        }

        self.rep_time_config = {
            'adult': {
                'low': 2,
                'moderate': 2,
                'high': 2
            },
            'middle_aged': {
                'low': 2.5,
                'moderate': 2.5,
                'high': 2.5
            },
            'older_adult': {
                'low': 3,
                'moderate': 3,
                'high': 3
            }
        }

        self.rest_time_config = {
            'adult': {
                'low': 60,
                'moderate': 45,
                'high': 30
            },
            'middle_aged': {
                'low': 75,
                'moderate': 60,
                'high': 45
            },
            'older_adult': {
                'low': 90,
                'moderate': 75,
                'high': 60
            }
        }

    def get_recommendations(self, age, activity_level):
        met_recommendations = {
            'adult': {
                'low': (2, 4),
                'moderate': (4, 6),
                'high': (6, 10)
            },
            'middle_aged': {
                'low': (2, 3.5),
                'moderate': (3.5, 5),
                'high': (5, 8)
            },
            'older_adult': {
                'low': (1.5, 3),
                'moderate': (3, 4),
                'high': (4, 6)
            }
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
        filtered_df = self.workouts_df[
            (self.workouts_df['MET Value'].between(met_range[0], met_range[1])) &
            (self.workouts_df['Difficulty'].isin(difficulty))
        ]
        return filtered_df

    def smart_get_workouts_for_focus(self, focus, activity_level, filtered_df):
        focus_to_type = {
            'Upper Body Strength': ['Strength'],
            'Lower Body Strength': ['Strength'],
            'Core Strength': ['Strength'],
            'Full Body Strength': ['Strength'],
            'Cardio': ['Cardio'],
            'HIIT': ['HIIT'],
            'Active Rest Day': ['Mobility', 'Stretching']
        }

        types = focus_to_type.get(focus, ['Strength'])
        pool = filtered_df[filtered_df['Type'].isin(types)].to_dict('records')

        if not pool:
            logger.warning("No workouts found for focus %s and types %s", focus, types)
            return []

        return pool

    def generate_plan(self, goal, program_duration, preferred_rest_day):
        weekly_structure = {
            'weight_loss': [
                'Cardio', 'Upper Body Strength', 'Lower Body Strength',
                'HIIT', 'Core Strength', 'Cardio', 'Rest Day'
            ],
            'build_muscle': [
                'Upper Body Strength', 'Lower Body Strength', 'Rest Day',
                'Core Strength', 'Full Body Strength', 'Upper Body Strength', 'Rest Day'
            ],
            'stay_fit': [
                'Cardio', 'Upper Body Strength', 'Lower Body Strength',
                'Core Strength', 'HIIT', 'Full Body Strength', 'Rest Day'
            ],
            'gain_weight': [
                'Upper Body Strength', 'Lower Body Strength', 'Rest Day',
                'Core Strength', 'Full Body Strength', 'Upper Body Strength', 'Rest Day'
            ]
        }

        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_plan = weekly_structure[goal]
        total_weeks = math.ceil(program_duration / 7)
        full_plan = []

        rest_day_index = days_of_week.index(preferred_rest_day)

        for week in range(total_weeks):
            for day in range(7):
                if (week * 7 + day) >= program_duration:
                    break

                day_name = days_of_week[day]
                plan_index = day % len(weekly_plan)
                focus = weekly_plan[plan_index]

                if day == rest_day_index and focus != 'Rest Day':
                    focus = 'Rest Day'
                elif day != rest_day_index and focus == 'Rest Day':
                    focus = 'Active Rest Day'

                full_plan.append({
                    'Day': f"Day {week * 7 + day + 1} ({day_name})",
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
        preferred_rest_day = user_data.get('preferredRestDay', 'Sunday')

        logger.info("Generating workout plan for user: age=%d, activity=%s, goal=%s, weight=%d, duration=%d, rest_day=%s",
                    age, activity_level, goal, weight, program_duration, preferred_rest_day)

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

                        # Use 'Name' column from CSV (changed from 'Exercise Name')
                        exercise_name = w.get('Name', 'Unknown Exercise')
                        logger.debug("Rest exercise: %s", exercise_name)

                        w['Sets'] = 1
                        w['Reps'] = '30 sec hold'
                        w['Rest Time (sec)'] = 30
                        w['Duration (min)'] = duration_min
                        w['Calories Burned'] = round(calories, 2)
                        w['Description'] = w.get('Description', 'No description available')
                        w['Name'] = exercise_name  # Set the Name field

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
                if not pool:
                    logger.warning("No workouts available for focus %s on %s", focus, day_data['Day'])
                    day_data['Total Duration (min)'] = 0
                    day_data['Total Calories Burned'] = 0
                    final_plan.append(day_data)
                    continue

                if len(pool) >= num_exercises:
                    selected = random.sample(pool, num_exercises)
                else:
                    selected = pool + random.sample(pool, num_exercises - len(pool))

                for w in selected:
                    met = w.get('MET Value', 3)
                    total_seconds = (sets * reps * rep_time) + ((sets - 1) * rest_time)
                    duration_min = total_seconds / 60
                    calories = calculate_calories_burned(met, duration_min, weight)

                    # Use 'Name' column from CSV (changed from 'Exercise Name')
                    exercise_name = w.get('Name', 'Unknown Exercise')
                    logger.debug("Selected exercise: %s", exercise_name)

                    w['Sets'] = sets
                    w['Reps'] = reps
                    w['Rest Time (sec)'] = rest_time
                    w['Duration (min)'] = round(duration_min, 2)
                    w['Calories Burned'] = round(calories, 2)
                    w['Description'] = w.get('Description', 'No description available')
                    w['Name'] = exercise_name  # Set the Name field

                    total_duration += duration_min
                    total_calories += calories
                    day_data['Workouts'].append(w)

                day_data['Total Duration (min)'] = round(total_duration, 2)
                day_data['Total Calories Burned'] = round(total_calories, 2)

            final_plan.append(day_data)

        logger.info("Generated final plan with %d days", len(final_plan))

        # Generate meal plan using MealService
        meal_plan = self.meal_service.generate_meal_plan(final_plan, user_data)
        
        return {
            "workout_plan": self.clean_nan(final_plan),
            "meal_plan": meal_plan
        }