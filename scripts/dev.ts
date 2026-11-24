// Starts the whole app in one terminal: npm run dev
// backend + frontend + ad worker + AI worker. Press Ctrl+C to stop everything.
// Where each job runs (Worker or Local) is chosen with the switch on the dashboard.
import { spawn, ChildProcess } from "child_process";

// 1. The list of things to start
const apps = [
  { name: "backend ", color: 36, args: ["run", "dev", "-w", "backend"] },
  // --strictPort: stop with an error if port 5173 is busy (another port would be blocked by the backend CORS check)
  { name: "frontend", color: 35, args: ["run", "dev", "-w", "frontend", "--", "--strictPort"] },
  { name: "adWorker", color: 33, args: ["run", "ad-worker", "-w", "backend"] },
  { name: "aiWorker", color: 32, args: ["run", "ai-worker", "-w", "backend"] },
];
console.log("Starting backend, frontend, ad worker and AI worker. Press Ctrl+C to stop everything.\n");

// 2. Start each one and print its output with a colored name in front
const children: ChildProcess[] = [];
for (const app of apps) {
  const child = spawn("npm", app.args, { env: { ...process.env, FORCE_COLOR: "1" } });
  const prefix = `\x1b[${app.color}m[${app.name}]\x1b[0m `;

  child.stdout?.on("data", (data: Buffer) => {
    for (const line of data.toString().split("\n")) if (line.trim()) process.stdout.write(prefix + line + "\n");
  });
  child.stderr?.on("data", (data: Buffer) => {
    for (const line of data.toString().split("\n")) if (line.trim()) process.stderr.write(prefix + line + "\n");
  });
  child.on("exit", (code) => console.log(`${prefix}stopped (exit code ${code})`));
  children.push(child);
}

// 3. Ctrl+C stops all of them
const stopAll = () => {
  for (const child of children) child.kill("SIGINT");
  setTimeout(() => process.exit(0), 1500);
};
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);
