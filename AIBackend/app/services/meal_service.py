# app/services/meal_service.py
import logging
from app.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MealService:
    def __init__(self):
        logger.info("Initialized MealService")

    def map_age_to_group(self, age):
        if age < 40:
            return 'adult'
        elif 40 <= age < 60:
            return 'middle_aged'
        else:
            return 'older_adult'

    def convert_activity_level(self, slider_value):
        if slider_value < 35:
            return 'low'
        elif slider_value < 70:
            return 'moderate'
        else:
            return 'high'

    def calculate_bmi(self, height_feet, weight_kg):
        height_meters = height_feet * 0.3048  # Convert feet to meters
        bmi = weight_kg / (height_meters ** 2)
        return round(bmi, 2)

    def adjust_calories(self, age, bmi, activity_level):
        if age < 30:
            bmr = 15.3 * bmi * 1.2 + 679
        elif age < 50:
            bmr = 11.6 * bmi * 1.2 + 879
        else:
            bmr = 13.5 * bmi * 1.2 + 487

        activity_multipliers = {
            "low": 1.2,
            "moderate": 1.55,
            "high": 1.9
        }
        return bmr * activity_multipliers.get(activity_level.lower(), 1.2)

    def adjust_meal_calories(self, base_calories, calories_burned, goal):
        if goal == "weight_loss":
            return max(1200, base_calories - 300 + calories_burned)
        elif goal == "build_muscle":
            return base_calories + 250 + calories_burned
        elif goal == "stay_fit":
            return base_calories + calories_burned
        elif goal == "gain_weight":
            return base_calories + 250 + calories_burned
        return base_calories

    def get_macronutrient_distribution(self, workout_type):
        macros_by_workout = {
            "strength": {"carbs": 40, "protein": 40, "fat": 20},
            "hiit": {"carbs": 50, "protein": 30, "fat": 20},
            "cardio": {"carbs": 55, "protein": 25, "fat": 20},
            "rest": {"carbs": 45, "protein": 30, "fat": 25},
            "mobility": {"carbs": 45, "protein": 30, "fat": 25},
            "stretching": {"carbs": 45, "protein": 30, "fat": 25}
        }
        return macros_by_workout.get(workout_type.lower(), macros_by_workout["rest"])

    def convert_macros_to_grams(self, total_calories, macro_distribution):
        calories_per_gram = {"carbs": 4, "protein": 4, "fat": 9}
        return {
            macro: round((percent / 100) * total_calories / calories_per_gram[macro], 1)
            for macro, percent in macro_distribution.items()
        }

    def generate_meal_plan(self, workout_plan, user_data):
        age = user_data.get('age')
        activity_level = self.convert_activity_level(user_data.get('activityLevel', 50))
        goal = user_data.get('goal')
        weight = user_data.get('weight')
        height = user_data.get('height', 5.5)  # Default height if not provided
        bmi = self.calculate_bmi(height, weight)

        logger.info("Generating meal plan for user: age=%d, activity=%s, goal=%s, weight=%d, height=%f, bmi=%f",
                    age, activity_level, goal, weight, height, bmi)

        meal_plan = []

        for day_plan in workout_plan:
            day_number = int(day_plan['Day'].split(' ')[1])  # Extract day number from "Day X (Weekday)"
            focus = day_plan['Focus']
            total_calories_burned = day_plan['Total Calories Burned']
            workouts = day_plan.get('Workouts', [])

            # Determine dominant workout type
            if not workouts or 'Rest' in focus:
                dominant_type = "rest"
            else:
                max_calories = -1
                dominant_type = ""
                for workout in workouts:
                    if workout['Calories Burned'] > max_calories:
                        max_calories = workout['Calories Burned']
                        dominant_type = workout['Type'].lower()

            # Calculate daily calories and macros
            base_calories = self.adjust_calories(age, bmi, activity_level)
            daily_calories = self.adjust_meal_calories(base_calories, total_calories_burned, goal)
            macro_distribution = self.get_macronutrient_distribution(dominant_type)
            macro_grams = self.convert_macros_to_grams(daily_calories, macro_distribution)

            meal_plan.append({
                'day_number': day_number,  # Still include day_number for reference
                'daily_calories': round(daily_calories, 2),
                'carbs_grams': macro_grams['carbs'],
                'protein_grams': macro_grams['protein'],
                'fat_grams': macro_grams['fat']
            })

        logger.info("Generated meal plan with %d days", len(meal_plan))
        return meal_plan
