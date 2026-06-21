export const getUserProfile = async (userId) => {

    try {
       
        const userData = {
            "athlete": {
                "name": "Rahul",
                "age": 28,
                "sex": "male",
                "height_cm": 175,
                "weight_kg": 68,
                "years_running": 3
            },

            "goals": {
                "primary_goal": "Half Marathon",
                "goal_race_date": "2026-10-18",
                "goal_time": "01:40:00",
                "duration_weeks": 12,
                "start_date": "2026-06-22"
            },

            "availability": {
                "days_per_week": 5,
                "preferred_rest_day": "Monday",
                "max_time_weekday_min": 75,
                "max_time_weekend_min": 150,
                "strength_training_days": ["Tuesday", "Friday"]
            },

            "injuries": {
                "current_injury": false,
                "past_injuries": [
                    {
                        "injury": "Achilles tendonitis",
                        "year": 2024,
                        "severity": "mild"
                    }
                ]
            },

            "recent_races": [
                {
                    "date": "2026-05-10",
                    "distance_km": 10,
                    "time_sec": 2820,
                    "avg_pace_sec_per_km": 282
                },
                {
                    "date": "2026-03-15",
                    "distance_km": 5,
                    "time_sec": 1320,
                    "avg_pace_sec_per_km": 264
                }
            ],

            "weekly_mileage_history": [
                {
                    "week_start": "2026-05-18",
                    "distance_km": 42
                },
                {
                    "week_start": "2026-05-25",
                    "distance_km": 46
                },
                {
                    "week_start": "2026-06-01",
                    "distance_km": 48
                },
                {
                    "week_start": "2026-06-08",
                    "distance_km": 44
                }
            ],

            "recent_runs": [
                {
                    "date": "2026-06-14",
                    "distance_km": 18.2,
                    "moving_time_sec": 6048,
                    "elapsed_time_sec": 6180,
                    "avg_pace_sec_per_km": 332,
                    "avg_hr": 145,
                    "max_hr": 161,
                    "cadence_spm": 176,
                    "elevation_gain_m": 120,
                    "type": "long",
                    "rpe": 4
                },
                {
                    "date": "2026-06-12",
                    "distance_km": 9.5,
                    "moving_time_sec": 3060,
                    "elapsed_time_sec": 3120,
                    "avg_pace_sec_per_km": 322,
                    "avg_hr": 151,
                    "max_hr": 168,
                    "cadence_spm": 178,
                    "elevation_gain_m": 45,
                    "type": "threshold",
                    "rpe": 7
                },
                {
                    "date": "2026-06-10",
                    "distance_km": 8.0,
                    "moving_time_sec": 2880,
                    "elapsed_time_sec": 2920,
                    "avg_pace_sec_per_km": 360,
                    "avg_hr": 138,
                    "max_hr": 150,
                    "cadence_spm": 174,
                    "elevation_gain_m": 30,
                    "type": "easy",
                    "rpe": 3
                },
                {
                    "date": "2026-06-08",
                    "distance_km": 12.0,
                    "moving_time_sec": 3900,
                    "elapsed_time_sec": 3960,
                    "avg_pace_sec_per_km": 325,
                    "avg_hr": 149,
                    "max_hr": 166,
                    "cadence_spm": 177,
                    "elevation_gain_m": 60,
                    "type": "interval",
                    "rpe": 8
                }
            ]
        };

        return userData;

    } catch (error) {
        console.error(error);
    }
};