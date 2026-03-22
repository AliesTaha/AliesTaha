#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HevyClient } from "./hevy-client.js";

const apiKey = process.env.HEVY_API_KEY;
if (!apiKey) {
  console.error("HEVY_API_KEY environment variable is required");
  process.exit(1);
}

const hevy = new HevyClient(apiKey);

const server = new McpServer({
  name: "hevy",
  version: "1.0.0",
});

// ── Set Schema (reused across tools) ────────────────────────

const SetSchema = z.object({
  type: z
    .enum(["normal", "warmup", "dropset", "failure"])
    .describe("Set type"),
  weight_kg: z.number().optional().describe("Weight in kg"),
  reps: z.number().optional().describe("Number of reps"),
  distance_meters: z.number().optional().describe("Distance in meters"),
  duration_seconds: z.number().optional().describe("Duration in seconds"),
  rpe: z.number().optional().describe("Rate of perceived exertion (0-10)"),
});

const ExerciseSchema = z.object({
  exercise_template_id: z.string().describe("Exercise template ID"),
  superset_id: z.number().nullable().optional().describe("Superset group ID"),
  notes: z.string().optional().describe("Notes for this exercise"),
  sets: z.array(SetSchema).describe("Sets for this exercise"),
});

// ── Workout Tools ───────────────────────────────────────────

server.tool(
  "get_workouts",
  "Get a paginated list of your Hevy workouts (most recent first)",
  {
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z.number().min(1).max(10).default(5).describe("Results per page"),
  },
  async ({ page, page_size }) => {
    const data = await hevy.getWorkouts(page, page_size);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_workout",
  "Get details of a specific workout by ID",
  {
    workout_id: z.string().describe("The workout ID"),
  },
  async ({ workout_id }) => {
    const data = await hevy.getWorkout(workout_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_workout_count",
  "Get total number of workouts logged in Hevy",
  {},
  async () => {
    const data = await hevy.getWorkoutCount();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_workout_events",
  "Get workout update/delete events since a given timestamp (for syncing)",
  {
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z.number().min(1).max(10).default(5).describe("Results per page"),
    since: z
      .string()
      .optional()
      .describe("ISO 8601 timestamp to get events since"),
  },
  async ({ page, page_size, since }) => {
    const data = await hevy.getWorkoutEvents(page, page_size, since);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_workout",
  "Log a new workout to Hevy",
  {
    title: z.string().describe("Workout title"),
    description: z.string().optional().describe("Workout description"),
    start_time: z.string().describe("ISO 8601 start time"),
    end_time: z.string().describe("ISO 8601 end time"),
    is_private: z.boolean().default(false).describe("Whether the workout is private"),
    exercises: z.array(ExerciseSchema).describe("Exercises performed"),
  },
  async ({ title, description, start_time, end_time, is_private, exercises }) => {
    const data = await hevy.createWorkout({
      title,
      description,
      start_time,
      end_time,
      is_private,
      exercises,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "update_workout",
  "Update an existing workout in Hevy",
  {
    workout_id: z.string().describe("The workout ID to update"),
    title: z.string().describe("Workout title"),
    description: z.string().optional().describe("Workout description"),
    start_time: z.string().describe("ISO 8601 start time"),
    end_time: z.string().describe("ISO 8601 end time"),
    is_private: z.boolean().default(false).describe("Whether the workout is private"),
    exercises: z.array(ExerciseSchema).describe("Exercises performed"),
  },
  async ({
    workout_id,
    title,
    description,
    start_time,
    end_time,
    is_private,
    exercises,
  }) => {
    const data = await hevy.updateWorkout(workout_id, {
      title,
      description,
      start_time,
      end_time,
      is_private,
      exercises,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Routine Tools ───────────────────────────────────────────

server.tool(
  "get_routines",
  "Get a paginated list of your workout routines",
  {
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z.number().min(1).max(10).default(5).describe("Results per page"),
  },
  async ({ page, page_size }) => {
    const data = await hevy.getRoutines(page, page_size);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_routine",
  "Get a specific routine by ID",
  {
    routine_id: z.string().describe("The routine ID"),
  },
  async ({ routine_id }) => {
    const data = await hevy.getRoutine(routine_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_routine",
  "Create a new workout routine",
  {
    title: z.string().describe("Routine title"),
    folder_id: z.string().optional().describe("Folder ID to place routine in"),
    notes: z.string().optional().describe("Routine notes"),
    exercises: z.array(ExerciseSchema).describe("Exercises in the routine"),
  },
  async ({ title, folder_id, notes, exercises }) => {
    const data = await hevy.createRoutine({
      title,
      folder_id,
      notes,
      exercises,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "update_routine",
  "Update an existing routine",
  {
    routine_id: z.string().describe("The routine ID to update"),
    title: z.string().describe("Routine title"),
    notes: z.string().optional().describe("Routine notes"),
    exercises: z.array(ExerciseSchema).describe("Exercises in the routine"),
  },
  async ({ routine_id, title, notes, exercises }) => {
    const data = await hevy.updateRoutine(routine_id, {
      title,
      notes,
      exercises,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Exercise Template Tools ─────────────────────────────────

server.tool(
  "get_exercise_templates",
  "Search/browse the exercise template library",
  {
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z
      .number()
      .min(1)
      .max(100)
      .default(10)
      .describe("Results per page"),
  },
  async ({ page, page_size }) => {
    const data = await hevy.getExerciseTemplates(page, page_size);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_exercise_template",
  "Get details of a specific exercise template by ID",
  {
    exercise_template_id: z.string().describe("The exercise template ID"),
  },
  async ({ exercise_template_id }) => {
    const data = await hevy.getExerciseTemplate(exercise_template_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_exercise_template",
  "Create a custom exercise template",
  {
    title: z.string().describe("Exercise name"),
    exercise_type: z
      .enum(["weight_reps", "reps_only", "bodyweight_reps", "bodyweight_assisted_reps", "duration", "weight_duration", "distance_duration", "short_distance_weight"])
      .describe("Type of exercise"),
    primary_muscle_group: z
      .enum([
        "abdominals", "shoulders", "biceps", "triceps", "forearms",
        "quadriceps", "hamstrings", "calves", "glutes", "abductors",
        "adductors", "lats", "upper_back", "traps", "lower_back",
        "chest", "cardio", "neck", "full_body", "other",
      ])
      .describe("Primary muscle group"),
    secondary_muscle_groups: z
      .array(z.string())
      .optional()
      .describe("Secondary muscle groups (same enum values as primary)"),
    equipment: z
      .enum([
        "none", "barbell", "dumbbell", "kettlebell", "machine",
        "plate", "resistance_band", "suspension", "other",
      ])
      .optional()
      .describe("Equipment used"),
  },
  async ({ title, exercise_type, primary_muscle_group, secondary_muscle_groups, equipment }) => {
    const data = await hevy.createExerciseTemplate({
      title,
      exercise_type,
      muscle_group: primary_muscle_group,
      other_muscles: secondary_muscle_groups,
      equipment_category: equipment,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Exercise History ────────────────────────────────────────

server.tool(
  "get_exercise_history",
  "Get your workout history for a specific exercise (to track progress over time)",
  {
    exercise_template_id: z.string().describe("The exercise template ID"),
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z.number().min(1).max(10).default(5).describe("Results per page"),
  },
  async ({ exercise_template_id, page, page_size }) => {
    const data = await hevy.getExerciseHistory(
      exercise_template_id,
      page,
      page_size
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Routine Folder Tools ────────────────────────────────────

server.tool(
  "get_routine_folders",
  "Get your routine folders for organization",
  {
    page: z.number().min(1).default(1).describe("Page number"),
    page_size: z.number().min(1).max(10).default(5).describe("Results per page"),
  },
  async ({ page, page_size }) => {
    const data = await hevy.getRoutineFolders(page, page_size);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_routine_folder",
  "Get a specific routine folder by ID",
  {
    folder_id: z.string().describe("The folder ID"),
  },
  async ({ folder_id }) => {
    const data = await hevy.getRoutineFolder(folder_id);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_routine_folder",
  "Create a new folder to organize routines",
  {
    title: z.string().describe("Folder name"),
  },
  async ({ title }) => {
    const data = await hevy.createRoutineFolder({ title });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Start the server ────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hevy MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
