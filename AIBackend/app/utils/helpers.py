import pandas as pd

def calculate_calories_burned(met, duration_minutes, weight_kg):
    return (met * 3.5 * weight_kg / 200) * duration_minutes

def map_age_to_group(age):
    if 15 <= age <= 34:
        return 'adult'
    elif 35 <= age <= 49:
        return 'middle_aged'
    elif age >= 50:
        return 'older_adult'
    else:
        raise ValueError("Age out of supported range (15+).")
        
def convert_activity_level(slider_value):
    if slider_value < 35:
        return 'low'
    elif slider_value < 70:
        return 'moderate'
    elif slider_value >= 70:
        return 'high'