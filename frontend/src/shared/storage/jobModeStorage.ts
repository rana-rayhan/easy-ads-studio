const JOB_MODE_KEY = "jobMode";

// Where jobs run: "worker" (RabbitMQ + workers) or "local" (the API does the job itself).
// Saved in the browser so the choice stays after a page reload. Default: "worker".
const jobModeStorage = {
  get: (): JobMode => {
    try {
      return localStorage.getItem(JOB_MODE_KEY) === "local" ? "local" : "worker";
    } catch {
      return "worker"; // localStorage can be blocked (private window), so fall back to the default
    }
  },

  save: (jobMode: JobMode) => {
    try {
      localStorage.setItem(JOB_MODE_KEY, jobMode);
    } catch {
      // Not saved: the choice still works until the page reloads
    }
  },
};

export default jobModeStorage;
