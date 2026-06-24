// ==========================
// MAIN SET SCHEMA
// ==========================
const mainSetSchema = {
  type: "OBJECT",
  nullable: true,
  properties: {
    warmup_minutes: {
      type: "NUMBER"
    },

    work: {
      type: "STRING"
    },

    recovery: {
      type: "STRING"
    },

    cooldown_minutes: {
      type: "NUMBER"
    }
  },

  required: [
    "warmup_minutes",
    "work",
    "recovery",
    "cooldown_minutes"
  ]
};

// ==========================
// DAY SCHEMA
// ==========================
const daySchema = {
  type: "OBJECT",

  properties: {
    day: {
      type: "STRING"
    },

    date: {
      type: "STRING"
    },

    workout_type: {
      type: "STRING"
    },

    description: {
      type: "STRING"
    },

    duration_minutes: {
      type: "NUMBER"
    },

    distance_km: {
      type: "NUMBER"
    },

    intensity_zone: {
      type: "STRING"
    },

    pace_sec_per_km: {
      type: "NUMBER"
    },

    pace_readable: {
      type: "STRING"
    },

    main_set: mainSetSchema,

    notes: {
      type: "STRING"
    },

    rest: {
      type: "BOOLEAN"
    }
  },

  required: [
    "day",
    "date",
    "workout_type",
    "description",
    "duration_minutes",
    "distance_km",
    "intensity_zone",
    "pace_sec_per_km",
    "pace_readable",
    "main_set",
    "notes",
    "rest"
  ]
};

// ==========================
// WEEKLY SUMMARY
// ==========================
const weeklySummarySchema = {
  type: "OBJECT",

  properties: {
    total_distance_km: {
      type: "NUMBER"
    },

    total_duration_minutes: {
      type: "NUMBER"
    },

    easy_runs: {
      type: "NUMBER"
    },

    quality_sessions: {
      type: "NUMBER"
    },

    rest_days: {
      type: "NUMBER"
    },

    long_run_km: {
      type: "NUMBER"
    },

    easy_percentage_estimate: {
      type: "NUMBER"
    },

    recovery_notes: {
      type: "STRING"
    }
  },

  required: [
    "total_distance_km",
    "total_duration_minutes",
    "easy_runs",
    "quality_sessions",
    "rest_days",
    "long_run_km",
    "easy_percentage_estimate",
    "recovery_notes"
  ]
};

// ==========================
// PHASE SCHEMA
// ==========================
const phaseSchema = {
  type: "OBJECT",

  properties: {
    phase_name: {
      type: "STRING"
    },

    start_week: {
      type: "NUMBER"
    },

    end_week: {
      type: "NUMBER"
    },

    focus: {
      type: "STRING"
    }
  },

  required: [
    "phase_name",
    "start_week",
    "end_week",
    "focus"
  ]
};

// ==========================
// WEEK SCHEMA
// ==========================
const weekSchema = {
  type: "OBJECT",

  properties: {
    week_number: {
      type: "NUMBER"
    },

    phase: {
      type: "STRING"
    },

    week_range: {
      type: "OBJECT",

      properties: {
        start_date: {
          type: "STRING"
        },

        end_date: {
          type: "STRING"
        }
      },

      required: [
        "start_date",
        "end_date"
      ]
    },

    target_distance_km: {
      type: "NUMBER"
    },

    training_days: {
      type: "NUMBER"
    },

    days: {
      type: "ARRAY",
      items: daySchema
    },

    weekly_summary: weeklySummarySchema
  },

  required: [
    "week_number",
    "phase",
    "week_range",
    "target_distance_km",
    "training_days",
    "days",
    "weekly_summary"
  ]
};

// ==========================
// PLAN METADATA
// ==========================
const planMetadataSchema = {
  type: "OBJECT",

  properties: {
    coach: {
      type: "STRING"
    },

    primary_goal: {
      type: "STRING"
    },

    goal_race_date: {
      type: "STRING"
    },

    goal_time: {
      type: "STRING"
    },

    total_weeks: {
      type: "NUMBER"
    },

    training_days_per_week: {
      type: "NUMBER"
    },

    training_level: {
      type: "STRING"
    },

    estimated_vdot: {
      type: "NUMBER"
    },

    assumptions: {
      type: "ARRAY",

      items: {
        type: "STRING"
      }
    }
  },

  required: [
    "coach",
    "primary_goal",
    "goal_race_date",
    "goal_time",
    "total_weeks",
    "training_days_per_week",
    "training_level",
    "estimated_vdot",
    "assumptions"
  ]
};

// ==========================
// ATHLETE SNAPSHOT
// ==========================
const athleteSnapshotSchema = {
  type: "OBJECT",

  properties: {
    current_weekly_mileage_km: {
      type: "NUMBER"
    },

    average_recent_pace_sec_per_km: {
      type: "NUMBER"
    },

    longest_recent_run_km: {
      type: "NUMBER"
    },

    recent_runs_count: {
      type: "NUMBER"
    },

    injury_risk_notes: {
      type: "ARRAY",

      items: {
        type: "STRING"
      }
    }
  },

  required: [
    "current_weekly_mileage_km",
    "average_recent_pace_sec_per_km",
    "longest_recent_run_km",
    "recent_runs_count",
    "injury_risk_notes"
  ]
};

// ==========================
// PACE ZONE
// ==========================
const paceZoneSchema = {
  type: "OBJECT",

  properties: {
    pace_sec_per_km: {
      type: "NUMBER"
    },

    pace_readable: {
      type: "STRING"
    }
  },

  required: [
    "pace_sec_per_km",
    "pace_readable"
  ]
};

// ==========================
// TRAINING PACES
// ==========================
const trainingPacesSchema = {
  type: "OBJECT",

  properties: {
    easy: paceZoneSchema,

    steady: paceZoneSchema,

    threshold: paceZoneSchema,

    interval: paceZoneSchema,

    repetition: paceZoneSchema,

    race_pace: paceZoneSchema
  },

  required: [
    "easy",
    "steady",
    "threshold",
    "interval",
    "repetition",
    "race_pace"
  ]
};

// ==========================
// COACH INSTRUCTIONS
// ==========================
const coachInstructionsSchema = {
  type: "OBJECT",

  properties: {
    progression_guidance: {
      type: "STRING"
    },

    recovery_guidance: {
      type: "STRING"
    },

    injury_precautions: {
      type: "STRING"
    },

    race_strategy: {
      type: "STRING"
    },

    when_to_adjust_plan: {
      type: "ARRAY",

      items: {
        type: "STRING"
      }
    }
  },

  required: [
    "progression_guidance",
    "recovery_guidance",
    "injury_precautions",
    "race_strategy",
    "when_to_adjust_plan"
  ]
};

// ==========================
// TOP LEVEL SCHEMA
// ==========================
export const trainingPlanSchema = {
  type: "OBJECT",

  properties: {
    plan_metadata: planMetadataSchema,

    athlete_snapshot: athleteSnapshotSchema,

    training_paces: trainingPacesSchema,

    phases: {
      type: "ARRAY",
      items: phaseSchema
    },

    weeks: {
      type: "ARRAY",
      items: weekSchema
    },

    coach_instructions: coachInstructionsSchema
  },

  required: [
    "plan_metadata",
    "athlete_snapshot",
    "training_paces",
    "phases",
    "weeks",
    "coach_instructions"
  ]
};