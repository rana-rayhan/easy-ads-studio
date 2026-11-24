import axios from "axios";
import { useState } from "react";
import { Alert, Button, Form, Input, InputNumber, Progress, Space, Spin, message } from "antd";
import { BulbOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import GoogleAdsApi from "../api/GoogleAdsApi";
import AiApi from "../../ai/api/AiApi";

type FormValues = { name: string; dailyBudget: number };

const GoogleCampaignPanel = () => {
  const [form] = Form.useForm<FormValues>();
  const queryClient = useQueryClient();

  // 1. Load campaigns from Google Ads (GET /api/google-ads/campaigns)
  const campaignsQuery = useQuery({
    queryKey: ["googleCampaigns"],
    queryFn: GoogleAdsApi.listCampaigns,
  });

  // 2. Create a campaign in Google Ads (POST /api/google-ads/campaigns)
  const createMutation = useMutation({
    mutationFn: GoogleAdsApi.createCampaign,
    onSuccess: (campaign) => {
      message.success(`Campaign created in Google Ads (id ${campaign.campaignId})`);
      form.resetFields();
      // Load the list again so the new campaign shows up
      queryClient.invalidateQueries({ queryKey: ["googleCampaigns"] });
    },
    onError: (error) => {
      // Show the backend message (for example Google's own error), otherwise a general one
      let errorMessage = "Could not create the campaign";
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        if (data?.message) errorMessage = data.message;
      }
      message.error(errorMessage);
    },
  });

  const onFinish = (values: FormValues) => {
    createMutation.mutate({ name: values.name.trim(), dailyBudget: values.dailyBudget });
  };

  // ==================== Idea 4: AI explains the campaigns ====================
  const [summaryJobId, setSummaryJobId] = useState<string | null>(null);

  // 1. Start the AI job (POST /api/ai/summarize-campaigns) -> jobId
  const summaryMutation = useMutation({
    mutationFn: AiApi.summarizeCampaigns,
    onSuccess: (data) => setSummaryJobId(data.jobId),
    onError: () => message.error("Could not start the AI job"),
  });

  // 2. Ask for the job every 1.5 seconds until it is completed or failed
  const summaryJobQuery = useQuery({
    queryKey: ["aiJob", summaryJobId],
    queryFn: () => AiApi.getJob(summaryJobId as string),
    enabled: !!summaryJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });

  const summaryJob = summaryJobQuery.data;
  const isSummarizing =
    summaryMutation.isPending ||
    (!!summaryJobId && (!summaryJob || summaryJob.status === "pending" || summaryJob.status === "processing"));
  const summary = summaryJob?.status === "completed" ? (summaryJob.result as IAiCampaignSummary) : null;

  // The biggest budget fills the whole bar, the others are a part of it
  const campaigns = campaignsQuery.data ?? [];
  const maxBudget = Math.max(1, ...campaigns.map((campaign) => campaign.dailyBudget));

  return (
    <div className="h-full rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-espresso-800">Google Ads campaigns</h2>
          <p className="text-sm text-espresso-500">From your Google Ads test account. New campaigns start paused.</p>
        </div>
        <Space>
          <Button
            icon={<BulbOutlined />}
            loading={isSummarizing}
            onClick={() => {
              setSummaryJobId(null); // clear the old result
              summaryMutation.mutate();
            }}
          >
            Explain with AI
          </Button>
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            loading={campaignsQuery.isFetching}
            onClick={() => campaignsQuery.refetch()}
            aria-label="Refresh campaigns"
          />
        </Space>
      </div>

      {/* Create a campaign: one row */}
      {/* name="googleCampaign" gives the inputs their own ids (googleCampaign_name...), separate from the ad form */}
      <Form form={form} name="googleCampaign" layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div className="grid gap-x-3 rounded-3xl bg-sage-50 p-4 sm:grid-cols-2 sm:items-end xl:grid-cols-[1fr_140px_auto]">
          <Form.Item name="name" label="Campaign name" rules={[{ required: true, whitespace: true, max: 100 }]} className="mb-3 xl:mb-0">
            <Input placeholder="Black Friday campaign" />
          </Form.Item>
          <Form.Item
            name="dailyBudget"
            label="Daily budget (EUR)"
            rules={[{ required: true, message: "Enter a daily budget" }]}
            className="mb-3 xl:mb-0"
          >
            <InputNumber min={1} max={1000} step={1} className="w-full" placeholder="5" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending} className="sm:col-span-2 xl:col-span-1">
            Create campaign
          </Button>
        </div>
      </Form>

      {/* Idea 4 result */}
      {isSummarizing && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
          <Spin size="small" /> {summaryJob?.message ?? "Sending your campaigns to the AI..."}
        </div>
      )}
      {summaryJob?.status === "failed" && (
        <Alert className="mt-4" type="error" showIcon message={summaryJob.message} closable onClose={() => setSummaryJobId(null)} />
      )}
      {summary && (
        <div className="mt-4 rounded-3xl bg-butter-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-espresso-800">{summary.summary}</p>
            <Button size="small" type="text" onClick={() => setSummaryJobId(null)}>
              Dismiss
            </Button>
          </div>
          {summary.tips.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-espresso-700">
              {summary.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-butter-500" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* The list: name, status, and a bar for the daily budget */}
      {campaignsQuery.isLoading && (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      )}
      {!campaignsQuery.isLoading && campaigns.length === 0 && (
        <p className="mt-6 rounded-3xl bg-sage-50 p-6 text-center text-sm text-espresso-500">
          {campaignsQuery.isError
            ? "Campaigns could not be loaded. Check the Google Ads setup in the README, then refresh."
            : "Create your first campaign above. It starts paused, so it costs nothing."}
        </p>
      )}
      {campaigns.length > 0 && (
        <ul className="mt-5 divide-y divide-sage-100">
          {campaigns.map((campaign) => (
            <li key={campaign.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-espresso-800">{campaign.name}</span>
                  <span className="text-xs text-espresso-400">
                    {campaign.channel.toLowerCase()} campaign, id {campaign.id}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      campaign.status === "ENABLED" ? "bg-sage-200 text-sage-800" : "bg-espresso-800/5 text-espresso-500"
                    }`}
                  >
                    {campaign.status === "ENABLED" ? "Running" : "Paused"}
                  </span>
                  <span className="font-display text-base font-bold">€{campaign.dailyBudget.toFixed(2)}</span>
                </span>
              </div>
              <Progress
                percent={(campaign.dailyBudget / maxBudget) * 100}
                showInfo={false}
                size="small"
                strokeColor="#ABC270"
                trailColor="#F4F6E8"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoogleCampaignPanel;
