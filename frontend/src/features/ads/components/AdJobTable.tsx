import { useState } from "react";
import { Button, Descriptions, Modal, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useAdJob, useAdJobs } from "../hooks/useAdHook";

// Pill text and colors for each job status
const STATUS_PILL: Record<AdJobStatus, { label: string; className: string }> = {
  pending: { label: "Waiting", className: "bg-espresso-800/5 text-espresso-500" },
  processing: { label: "Processing", className: "bg-sage-200 text-sage-800" },
  completed: { label: "Done", className: "bg-apricot-400 text-white" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

// Dot on the timeline line for each job status
const STATUS_DOT: Record<AdJobStatus, string> = {
  pending: "bg-white ring-espresso-300",
  processing: "bg-sage-400 ring-sage-200",
  completed: "bg-apricot-400 ring-apricot-100",
  failed: "bg-red-500 ring-red-100",
};

const formatTime = (value?: string) =>
  value ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

// Shows GET /api/ads/jobs/:id for one job, refreshing until it finishes.
const AdJobModal = ({ jobId, onClose }: { jobId: string | null; onClose: () => void }) => {
  const { data: job, isLoading } = useAdJob(jobId);

  return (
    <Modal open={!!jobId} onCancel={onClose} footer={null} title="Job details" loading={isLoading}>
      {job && (
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Job ID">{job.id}</Descriptions.Item>
          <Descriptions.Item label="Ad ID">{job.adId}</Descriptions.Item>
          <Descriptions.Item label="Headline">{job.headline ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[job.status].className}`}>
              {STATUS_PILL[job.status].label}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Message">{job.message}</Descriptions.Item>
          <Descriptions.Item label="Google ad ID">{job.googleAdId ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatTime(job.createdAt)}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
};

// The user's ad jobs as a timeline, newest first. Click a job to see all its details.
const AdJobTable = () => {
  const { data: jobs = [], isLoading, isFetching, refetch } = useAdJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <div className="h-full rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-espresso-800">Your jobs</h2>
          <p className="text-sm text-espresso-500">Updates by itself while a job runs.</p>
        </div>
        <Button shape="circle" icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()} aria-label="Refresh jobs" />
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      )}

      {/* Empty: invite to create the first ad */}
      {!isLoading && jobs.length === 0 && (
        <div className="rounded-3xl bg-sage-50 p-6 text-center">
          <p className="font-display text-lg font-bold">Create your first ad</p>
          <p className="mt-1 text-sm text-espresso-500">Its job shows up here and moves from waiting to done.</p>
        </div>
      )}

      {/* Timeline: a dashed line with one dot per job */}
      {jobs.length > 0 && (
        <ol className="relative ml-2 border-l-2 border-dashed border-sage-200">
          {jobs.map((job) => (
            <li key={job.id} className="relative mb-2 pl-6 last:mb-0">
              <span
                className={`absolute -left-[9px] top-4 h-4 w-4 rounded-full ring-4 ${STATUS_DOT[job.status]} ${
                  job.status === "processing" ? "motion-safe:animate-pulse" : ""
                }`}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-sage-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
              >
                <span className="min-w-0">
                  <span className={`block truncate font-semibold ${job.status === "pending" ? "text-espresso-400" : "text-espresso-800"}`}>
                    {job.headline ?? "Ad"}
                  </span>
                  <span className="block truncate text-xs text-espresso-400">
                    {formatTime(job.createdAt)}
                    <span className="ml-2 text-espresso-500">{job.message}</span>
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[job.status].className}`}>
                  {STATUS_PILL[job.status].label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <AdJobModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
    </div>
  );
};

export default AdJobTable;
