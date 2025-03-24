import pandas as pd

def calculate_calories_burned(met, duration_minutes, weight_kg):
    return (met * 3.5 * weight_kg / 200) * duration_minutes

def map_age_to_group(age):
    if age < 40:
        return 'adult'
    elif 40 <= age < 60:
        return 'middle_aged'
    else:
        return 'older_adult'

def convert_activity_level(slider_value):
    if slider_value < 35:
        return 'low'
    elif slider_value < 70:
        return 'moderate'
    else:
        return 'high'