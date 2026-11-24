import axios from "axios";
import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AdApi from "../api/AdApi";
import { handleApiError } from "../../../shared/api/apiError";

const POLL_MS = 2000;
const isRunning = (status?: AdJobStatus) => status === "pending" || status === "processing";

// 4xx messages from our backend are safe to show as they are. Everything else uses the shared handler.
const showAdError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status ?? 500;
    const apiMessage = error.response?.data?.message;
    if (status < 500 && apiMessage) return message.error(apiMessage);
  }
  handleApiError(error);
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: AdApi.create,
    onSuccess: () => {
      message.success("Ad created, job queued");
      queryClient.invalidateQueries({ queryKey: ["adJobs"] });
    },
    onError: showAdError,
  });

  return { createAd: mutation.mutate, isCreating: mutation.isPending };
};

// All jobs of the user. Polls every 2s while any job is still running.
export const useAdJobs = () =>
  useQuery({
    queryKey: ["adJobs"],
    queryFn: AdApi.listJobs,
    refetchInterval: (query) => (query.state.data?.some((job) => isRunning(job.status)) ? POLL_MS : false),
  });

// One job. Polls every 2s until it is completed or failed.
export const useAdJob = (jobId: string | null) =>
  useQuery({
    queryKey: ["adJob", jobId],
    queryFn: () => AdApi.getJob(jobId as string),
    enabled: !!jobId,
    refetchInterval: (query) => (isRunning(query.state.data?.status) ? POLL_MS : false),
  });
