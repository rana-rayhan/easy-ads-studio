import { useState } from "react";
import type { FormInstance } from "antd";
import { Alert, Button, Form, Input, Select, Spin, message } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import AiApi from "../api/AiApi";

type FormValues = { product: string; audience: string; tone: string };

// Idea 1: the AI writes headlines and descriptions. "Use" copies one into the "Create ad" form.
const AiCopyPanel = ({ adForm }: { adForm: FormInstance<CreateAdFormValues> }) => {
  const [form] = Form.useForm<FormValues>();
  const [jobId, setJobId] = useState<string | null>(null);

  // 1. Start the AI job (POST /api/ai/suggest-copy) -> we get a jobId back
  const startMutation = useMutation({
    mutationFn: AiApi.suggestCopy,
    onSuccess: (data) => setJobId(data.jobId),
    onError: () => message.error("Could not start the AI job"),
  });

  // 2. Ask for the job every 1.5 seconds until it is completed or failed
  const jobQuery = useQuery({
    queryKey: ["aiJob", jobId],
    queryFn: () => AiApi.getJob(jobId as string),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });

  const job = jobQuery.data;
  const isThinking = startMutation.isPending || (!!jobId && (!job || job.status === "pending" || job.status === "processing"));
  const suggestion = job?.status === "completed" ? (job.result as IAiCopySuggestion) : null;

  const onFinish = (values: FormValues) => {
    setJobId(null); // clear the old result
    startMutation.mutate({ product: values.product.trim(), audience: values.audience.trim(), tone: values.tone });
  };

  return (
    <div className="rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-espresso-800">
            <BulbOutlined className="text-butter-500" /> AI studio
          </h2>
          <p className="text-sm text-espresso-500">Describe what you sell. The AI writes 3 headlines and 3 descriptions.</p>
        </div>
        <span className="rounded-full bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">Runs on your computer</span>
      </div>

      <Form form={form} name="aiCopy" layout="vertical" onFinish={onFinish} initialValues={{ tone: "friendly" }} requiredMark={false}>
        <div className="grid gap-x-4 md:grid-cols-[1fr_1fr_200px_auto] md:items-end">
          <Form.Item name="product" label="Product" rules={[{ required: true, whitespace: true, max: 200 }]}>
            <Input placeholder="Fresh coffee beans" />
          </Form.Item>
          <Form.Item name="audience" label="Audience" rules={[{ required: true, whitespace: true, max: 200 }]}>
            <Input placeholder="Office workers" />
          </Form.Item>
          <Form.Item name="tone" label="Tone">
            <Select
              options={[
                { value: "friendly", label: "Friendly" },
                { value: "professional", label: "Professional" },
                { value: "funny", label: "Funny" },
                { value: "urgent", label: "Urgent (limited offer)" },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isThinking} className="w-full md:w-auto">
              Suggest ad text
            </Button>
          </Form.Item>
        </div>
      </Form>

      {/* While the AI works */}
      {isThinking && (
        <div className="flex items-center gap-3 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
          <Spin size="small" /> {job?.message ?? "Sending to the AI..."}
        </div>
      )}

      {/* Failed */}
      {job?.status === "failed" && <Alert type="error" showIcon message={job.message} />}

      {/* Result: click an idea to copy it into the "Create ad" form */}
      {suggestion && (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-espresso-800">
              Headlines <span className="font-normal text-espresso-400">click one to use it</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestion.headlines.map((headline) => (
                <button
                  key={headline}
                  type="button"
                  onClick={() => {
                    adForm.setFieldsValue({ headline });
                    message.success("Headline added to Create ad");
                  }}
                  className="rounded-full border border-sage-200 bg-white px-4 py-2 text-left text-sm font-medium text-espresso-800 transition-colors hover:border-sage-400 hover:bg-sage-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
                >
                  {headline} <span className="text-xs text-espresso-400">{headline.length}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-espresso-800">
              Descriptions <span className="font-normal text-espresso-400">click one to use it</span>
            </h3>
            <div className="flex flex-col gap-2">
              {suggestion.descriptions.map((description) => (
                <button
                  key={description}
                  type="button"
                  onClick={() => {
                    adForm.setFieldsValue({ description });
                    message.success("Description added to Create ad");
                  }}
                  className="rounded-2xl border border-sage-200 bg-white px-4 py-2.5 text-left text-sm text-espresso-800 transition-colors hover:border-sage-400 hover:bg-sage-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
                >
                  {description} <span className="text-xs text-espresso-400">{description.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCopyPanel;
