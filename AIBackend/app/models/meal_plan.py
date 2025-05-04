from typing import Dict, List, Any
import numpy as np
import logging
import os
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

# Global user variables
USER_AGE = None
USER_AGE_GROUP = None
USER_ACTIVITY_LEVEL = None
USER_GOAL = None
USER_WEIGHT = None
USER_HEIGHT = None
USER_BMI = None

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

def calculate_bmi(height_feet: float, weight_kg: float) -> float:
    height_meters = height_feet * 0.3048
    bmi = weight_kg / (height_meters ** 2)
    logger.debug(f"Calculated BMI: Height={height_feet} ft, Weight={weight_kg} kg, BMI={bmi}")
    return round(bmi, 2)

def load_user_profile(data: Dict[str, Any]) -> None:
    global USER_AGE, USER_AGE_GROUP, USER_ACTIVITY_LEVEL, USER_GOAL, USER_WEIGHT, USER_HEIGHT, USER_BMI
    try:
        logger.info("Loading user profile for meal plan")
        USER_AGE = data['age']
        USER_ACTIVITY_LEVEL = convert_activity_level(data['activityLevel'])
        USER_GOAL = data['goal']
        USER_WEIGHT = data['weight']
        USER_HEIGHT = data['height']
        USER_AGE_GROUP = map_age_to_group(USER_AGE)
        USER_BMI = calculate_bmi(USER_HEIGHT, USER_WEIGHT)
        logger.info(f"User profile loaded: Age={USER_AGE}, ActivityLevel={USER_ACTIVITY_LEVEL}, Goal={USER_GOAL}, BMI={USER_BMI}")
    except KeyError as e:
        logger.error(f"Missing required field in user profile data: {e}")
        raise

def adjust_calories(age: int, bmi: float, activity_level: str) -> float:
    if age < 30:
        bmr = 15.3 * bmi * 1.2 + 679
    elif age < 50:
        bmr = 11.6 * bmi * 1.2 + 879
    else:
        bmr = 13.5 * bmi * 1.2 + 487

    activity_multipliers = {"low": 1.2, "moderate": 1.55, "high": 1.9}
    calories = bmr * activity_multipliers.get(activity_level.lower(), 1.2)
    logger.debug(f"Adjusted calories: Age={age}, BMI={bmi}, ActivityLevel={activity_level}, Calories={calories}")
    return calories

def adjust_meal_calories(base_calories: float, calories_burned: float, goal: str) -> float:
    if goal == "weight_loss":
        calories = max(1200, base_calories - 300 + calories_burned)
    elif goal == "muscle_gain":
        calories = base_calories + 250 + calories_burned
    elif goal == "maintenance":
        calories = base_calories + calories_burned
    else:
        calories = base_calories
    logger.debug(f"Adjusted meal calories: Base={base_calories}, Burned={calories_burned}, Goal={goal}, Final={calories}")
    return calories

def get_macronutrient_distribution(workout_type: str) -> Dict[str, int]:
    macros_by_workout = {
        "strength": {"carbs": 40, "protein": 40, "fat": 20},
        "hiit": {"carbs": 50, "protein": 30, "fat": 20},
        "cardio": {"carbs": 55, "protein": 25, "fat": 20},
        "rest": {"carbs": 45, "protein": 30, "fat": 25}
    }
    macros = macros_by_workout.get(workout_type.lower(), macros_by_workout["rest"])
    logger.debug(f"Macronutrient distribution for workout type {workout_type}: {macros}")
    return macros

def convert_macros_to_grams(total_calories: float, macro_distribution: Dict[str, int]) -> Dict[str, float]:
    calories_per_gram = {"carbs": 4, "protein": 4, "fat": 9}
    macro_grams = {
        macro: round((percent / 100) * total_calories / calories_per_gram[macro], 1)
        for macro, percent in macro_distribution.items()
    }
    logger.debug(f"Converted macros to grams: TotalCalories={total_calories}, Macros={macro_grams}")
    return macro_grams

# New functions for sleep and water calculations
def baseline_sleep(age: int) -> float:
    if age < 26:
        return 8.0
    elif age < 65:
        return 7.5
    else:
        return 7.0

def baseline_water(age: int, weight_kg: float) -> float:
    if age < 26:
        ml_per_kg = 40
    elif age < 65:
        ml_per_kg = 35
    else:
        ml_per_kg = 30
    return round((ml_per_kg * weight_kg) / 1000, 2)

def adjust_sleep_by_calories(base_sleep: float, calories_burned: float) -> float:
    if calories_burned >= 500:
        return base_sleep + 0.5
    elif calories_burned >= 300:
        return base_sleep + 0.25
    return base_sleep

def adjust_water_by_calories(base_water: float, calories_burned: float) -> float:
    if calories_burned >= 500:
        return round(base_water + 0.75, 2)
    elif calories_burned >= 300:
        return round(base_water + 0.5, 2)
    return base_water

def clean_meal_data(meal: Dict) -> Dict:
    logger.debug("Cleaning meal data")
    cleaned_meal = {}
    for key, value in meal.items():
        if isinstance(value, float) and np.isnan(value):
            cleaned_meal[key] = None
        else:
            cleaned_meal[key] = value
    return cleaned_meal

def generate_meal_plan(workout_plan_data: List[Dict], data: Dict[str, Any]) -> List[Dict]:
    try:
        logger.info("Starting meal plan generation")
        load_user_profile(data)
        meal_plan = []

        # Unpack the workout plan data if it's a tuple (contains intensity)
        if isinstance(workout_plan_data, tuple):
            workout_plan, _ = workout_plan_data
        else:
            workout_plan = workout_plan_data

        for day_data in workout_plan:
            day = day_data['Day']
            date_str = day_data['Date']
            total_calories = day_data['Total Calories Burned']
            workouts = day_data.get('Workouts', [])

            if not workouts:
                dominant_type = "rest"
                logger.info(f"{day}: No workouts, using dominant type 'rest'")
            else:
                max_calories = -1
                dominant_type = ""
                for workout in workouts:
                    if workout['Calories Burned'] > max_calories:
                        max_calories = workout['Calories Burned']
                        dominant_type = workout['Type'].lower()
                logger.info(f"{day}: Dominant workout type={dominant_type}, Max Calories={max_calories}")

            base_calories = adjust_calories(USER_AGE, USER_BMI, USER_ACTIVITY_LEVEL)
            daily_calories = adjust_meal_calories(base_calories, total_calories, USER_GOAL)
            macro_distribution = get_macronutrient_distribution(dominant_type)
            macro_grams = convert_macros_to_grams(daily_calories, macro_distribution)

            # Calculate sleep and water recommendations
            base_sleep = baseline_sleep(USER_AGE)
            base_water = baseline_water(USER_AGE, USER_WEIGHT)
            sleep_hours = adjust_sleep_by_calories(base_sleep, total_calories)
            water_litres = adjust_water_by_calories(base_water, total_calories)

            meal = {
                'Day': day,
                'Date': date_str,
                'daily_calories': round(daily_calories, 2),
                'carbs_grams': macro_grams['carbs'],
                'protein_grams': macro_grams['protein'],
                'fat_grams': macro_grams['fat'],
                'sleep_hours': round(sleep_hours, 2),  # Add sleep hours
                'water_litres': round(water_litres, 2)  # Add water liters
            }

            cleaned_meal = clean_meal_data(meal)
            meal_plan.append(cleaned_meal)
            logger.info(f"Generated meal for {day}: Calories={daily_calories}, Carbs={macro_grams['carbs']}g, Protein={macro_grams['protein']}g, Fat={macro_grams['fat']}g, Sleep={sleep_hours}h, Water={water_litres}L")

        logger.info("Meal plan generation completed")
        return meal_plan

    except Exception as e:
        logger.error(f"Error generating meal plan: {str(e)}")
        raise