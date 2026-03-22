const BASE_URL = "https://api.hevyapp.com/v1";

export class HevyClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Hevy API error ${res.status}: ${text}`);
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  // ── Workouts ──────────────────────────────────────────────

  async getWorkouts(page = 1, pageSize = 5) {
    return this.request<any>("GET", "/workouts", undefined, {
      page: String(page),
      pageSize: String(pageSize),
    });
  }

  async getWorkout(workoutId: string) {
    return this.request<any>("GET", `/workouts/${workoutId}`);
  }

  async getWorkoutCount() {
    return this.request<any>("GET", "/workouts/count");
  }

  async getWorkoutEvents(page = 1, pageSize = 5, since?: string) {
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (since) params.since = since;
    return this.request<any>("GET", "/workouts/events", undefined, params);
  }

  async createWorkout(workout: any) {
    return this.request<any>("POST", "/workouts", { workout });
  }

  async updateWorkout(workoutId: string, workout: any) {
    return this.request<any>("PUT", `/workouts/${workoutId}`, { workout });
  }

  // ── Routines ──────────────────────────────────────────────

  async getRoutines(page = 1, pageSize = 5) {
    return this.request<any>("GET", "/routines", undefined, {
      page: String(page),
      pageSize: String(pageSize),
    });
  }

  async getRoutine(routineId: string) {
    return this.request<any>("GET", `/routines/${routineId}`);
  }

  async createRoutine(routine: any) {
    return this.request<any>("POST", "/routines", { routine });
  }

  async updateRoutine(routineId: string, routine: any) {
    return this.request<any>("PUT", `/routines/${routineId}`, { routine });
  }

  // ── Exercise Templates ────────────────────────────────────

  async getExerciseTemplates(page = 1, pageSize = 10) {
    return this.request<any>("GET", "/exercise_templates", undefined, {
      page: String(page),
      pageSize: String(pageSize),
    });
  }

  async getExerciseTemplate(exerciseTemplateId: string) {
    return this.request<any>(
      "GET",
      `/exercise_templates/${exerciseTemplateId}`
    );
  }

  async createExerciseTemplate(template: any) {
    return this.request<any>("POST", "/exercise_templates", {
      exercise_template: template,
    });
  }

  // ── Exercise History ──────────────────────────────────────

  async getExerciseHistory(
    exerciseTemplateId: string,
    page = 1,
    pageSize = 5
  ) {
    return this.request<any>(
      "GET",
      `/exercise_templates/${exerciseTemplateId}/history`,
      undefined,
      { page: String(page), pageSize: String(pageSize) }
    );
  }

  // ── Routine Folders ───────────────────────────────────────

  async getRoutineFolders(page = 1, pageSize = 5) {
    return this.request<any>("GET", "/routine_folders", undefined, {
      page: String(page),
      pageSize: String(pageSize),
    });
  }

  async getRoutineFolder(folderId: string) {
    return this.request<any>("GET", `/routine_folders/${folderId}`);
  }

  async createRoutineFolder(folder: any) {
    return this.request<any>("POST", "/routine_folders", { routine_folder: folder });
  }
}
