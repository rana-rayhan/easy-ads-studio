import { Alert } from "antd";
import { useQuery } from "@tanstack/react-query";

import WorkerApi from "../../jobs/api/WorkerApi";
import GoogleAdsApi from "../../googleAds/api/GoogleAdsApi";
import { useAdJobs } from "../../ads/hooks/useAdHook";
import jobModeStorage from "../../../shared/storage/jobModeStorage";

// Top of the dashboard: greeting, three numbers, and the live job pipeline API -> RabbitMQ -> Worker -> Ollama.
const DashboardHero = ({ email }: { email?: string }) => {
  // 1. Where jobs run. The navbar switch writes this value into the same cache key.
  const { data: jobMode = "worker" } = useQuery({
    queryKey: ["jobMode"],
    queryFn: () => jobModeStorage.get(),
    staleTime: Infinity,
  });

  // 2. Is RabbitMQ up, are the workers running? (GET /api/workers, every 5 s)
  const { data: workers } = useQuery({
    queryKey: ["workerStatus"],
    queryFn: WorkerApi.getStatus,
    refetchInterval: 5000,
  });

  // 3. Numbers for the stats (same cache keys as the jobs list and the campaigns panel, so no extra requests)
  const { data: jobs = [] } = useAdJobs();
  const { data: campaigns = [] } = useQuery({ queryKey: ["googleCampaigns"], queryFn: GoogleAdsApi.listCampaigns });
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.dailyBudget, 0);

  // A job is "moving" when one is waiting or running right now
  const isJobRunning = jobs.some((job) => job.status === "pending" || job.status === "processing");
  const isLocal = jobMode === "local";
  const isWorkerMissing = !isLocal && !!workers && (!workers.adWorker || !workers.aiWorker);

  const name = (email ?? "").split("@")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="relative overflow-hidden rounded-4xl bg-sage-600 p-6 text-white sm:p-8">
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-sage-100">{today}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {name}</h1>
        </div>

        {/* Three numbers */}
        <dl className="flex gap-8">
          <div>
            <dt className="text-xs text-sage-100">Ad jobs</dt>
            <dd className="font-display text-3xl font-bold">{jobs.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-sage-100">Campaigns</dt>
            <dd className="font-display text-3xl font-bold">{campaigns.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-sage-100">Daily budget</dt>
            <dd className="font-display text-3xl font-bold">€{totalBudget.toFixed(0)}</dd>
          </div>
        </dl>
      </div>

      {/* The pipeline: each step is a tile, the arrows show the way a job travels */}
      <ol className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="How a job runs">
        <li className="rounded-3xl bg-sage-500 p-4">
          <p className="font-display text-lg font-bold">API</p>
          <p className="text-sm text-sage-100">Saves the job in Redis</p>
        </li>

        <li className={`rounded-3xl p-4 transition-opacity ${isLocal ? "bg-sage-500/40 opacity-60" : "bg-sage-500"}`}>
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            RabbitMQ
            <span
              className={`h-2.5 w-2.5 rounded-full ${workers?.rabbitmq ? "bg-butter-400" : "bg-apricot-400"}`}
              aria-hidden="true"
            />
          </p>
          <p className="text-sm text-sage-100">{isLocal ? "Skipped in local mode" : workers?.rabbitmq ? "Queue is up" : "Not reachable"}</p>
        </li>

        <li
          className={`rounded-3xl p-4 transition-colors ${
            isJobRunning ? "bg-butter-400 text-espresso-800" : "bg-sage-500"
          }`}
        >
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            {isLocal ? "API runs it" : "Workers"}
            {isJobRunning && <span className="h-2.5 w-2.5 rounded-full bg-apricot-500 motion-safe:animate-ping" aria-hidden="true" />}
          </p>
          <p className={`text-sm ${isJobRunning ? "text-espresso-700" : "text-sage-100"}`}>
            {isLocal
              ? "No worker needed"
              : `Ad ${workers?.adWorker ? "on" : "off"}, AI ${workers?.aiWorker ? "on" : "off"}`}
          </p>
        </li>

        <li className="rounded-3xl bg-sage-500 p-4">
          <p className="font-display text-lg font-bold">Ollama</p>
          <p className="text-sm text-sage-100">Local AI, gemma3:4b</p>
        </li>
      </ol>

      {/* In worker mode, a stopped worker means its jobs wait in the queue */}
      {isWorkerMissing && (
        <Alert
          className="relative mt-4"
          type="warning"
          showIcon
          message="A worker is not running, so its jobs will wait in the queue. Start it, or switch to Local in the top bar."
        />
      )}
    </section>
  );
};

export default DashboardHero;
