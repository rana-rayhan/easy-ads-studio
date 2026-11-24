import { useEffect, useState } from "react";
import type { FormInstance, UploadFile } from "antd";
import { Alert, Button, Form, Input, Progress, Spin, Upload, message } from "antd";
import { CheckCircleOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useCreateAd } from "../hooks/useAdHook";
import AiApi from "../../ai/api/AiApi";

const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp";

// The form instance comes from the Dashboard, so the AI ideas panel can fill this form too.
const CreateAdForm = ({ form }: { form: FormInstance<CreateAdFormValues> }) => {
  const { createAd, isCreating } = useCreateAd();

  const onFinish = (values: CreateAdFormValues) => {
    const file = values.image?.[0]?.originFileObj;
    if (!file) return;

    // Multipart body, same field names the backend reads.
    const formData = new FormData();
    formData.append("headline", values.headline.trim());
    formData.append("description", values.description.trim());
    formData.append("image", file);

    createAd(formData, { onSuccess: () => form.resetFields() });
  };

  // ==================== Idea 2: AI suggests text from the image ====================
  const [imageJobId, setImageJobId] = useState<string | null>(null);

  // 1. Send the chosen image to the AI (POST /api/ai/describe-image) -> jobId
  const imageMutation = useMutation({
    mutationFn: AiApi.describeImage,
    onSuccess: (data) => setImageJobId(data.jobId),
    onError: () => message.error("Could not start the AI job"),
  });

  // 2. Ask for the job every 1.5 seconds until it is completed or failed
  const imageJobQuery = useQuery({
    queryKey: ["aiJob", imageJobId],
    queryFn: () => AiApi.getJob(imageJobId as string),
    enabled: !!imageJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });

  const imageJob = imageJobQuery.data;
  const isReadingImage =
    imageMutation.isPending ||
    (!!imageJobId && (!imageJob || imageJob.status === "pending" || imageJob.status === "processing"));
  const imageSuggestion = imageJob?.status === "completed" ? (imageJob.result as IAiImageSuggestion) : null;

  const onSuggestFromImage = () => {
    const fileList = form.getFieldValue("image") as UploadFile[] | undefined;
    const file = fileList?.[0]?.originFileObj;
    if (!file) {
      message.warning("Choose an image first");
      return;
    }
    setImageJobId(null); // clear the old result
    imageMutation.mutate(file);
  };

  // ==================== Idea 3: AI reviews the text before sending ====================
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);

  // 1. Send headline + description to the AI (POST /api/ai/review-ad) -> jobId
  const reviewMutation = useMutation({
    mutationFn: AiApi.reviewAd,
    onSuccess: (data) => setReviewJobId(data.jobId),
    onError: () => message.error("Could not start the AI job"),
  });

  // 2. Ask for the job every 1.5 seconds until it is completed or failed
  const reviewJobQuery = useQuery({
    queryKey: ["aiJob", reviewJobId],
    queryFn: () => AiApi.getJob(reviewJobId as string),
    enabled: !!reviewJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });

  const reviewJob = reviewJobQuery.data;
  const isReviewing =
    reviewMutation.isPending ||
    (!!reviewJobId && (!reviewJob || reviewJob.status === "pending" || reviewJob.status === "processing"));
  const review = reviewJob?.status === "completed" ? (reviewJob.result as IAiAdReview) : null;

  const onReview = () => {
    const headline = String(form.getFieldValue("headline") ?? "").trim();
    const description = String(form.getFieldValue("description") ?? "").trim();
    if (!headline || !description) {
      message.warning("Write a headline and a description first");
      return;
    }
    setReviewJobId(null); // clear the old result
    reviewMutation.mutate({ headline, description });
  };

  // ==================== Live preview: shows the ad while you type ====================
  const headline = Form.useWatch("headline", form) ?? "";
  const description = Form.useWatch("description", form) ?? "";
  const imageList = Form.useWatch("image", form) as UploadFile[] | undefined;
  const imageFile = imageList?.[0]?.originFileObj;

  // Make a temporary URL for the chosen image, and free it when the image changes
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!imageFile) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      {/* Left: the form */}
      <div className="rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-espresso-800">Create ad</h2>
        <p className="mb-5 text-sm text-espresso-500">Write it yourself, use an AI idea, or let the AI read your image.</p>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="headline" label="Headline" rules={[{ required: true, whitespace: true, max: 30 }]}>
            <Input placeholder="Fresh coffee, 20% off" showCount maxLength={30} />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true, whitespace: true, max: 90 }]}>
            <Input.TextArea rows={3} placeholder="Start your day with our morning blend. Order online today." showCount maxLength={90} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            extra="jpeg, png or webp, up to 5 MB"
            valuePropName="fileList"
            getValueFromEvent={(event: { fileList: UploadFile[] }) => event.fileList}
            rules={[{ required: true, message: "Choose an image for the ad" }]}
          >
            {/* beforeUpload returning false keeps the file in the form instead of uploading it right away. */}
            <Upload accept={ACCEPTED_IMAGES} maxCount={1} beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>

          {/* AI helpers */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button icon={<PictureOutlined />} onClick={onSuggestFromImage} loading={isReadingImage}>
              Text from image
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={onReview} loading={isReviewing}>
              Check with AI
            </Button>
          </div>

          {/* Idea 2 result */}
          {isReadingImage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
              <Spin size="small" /> {imageJob?.message ?? "Sending the image to the AI..."}
            </div>
          )}
          {imageJob?.status === "failed" && (
            <Alert className="mb-4" type="error" showIcon message={imageJob.message} closable onClose={() => setImageJobId(null)} />
          )}
          {imageSuggestion && (
            <div className="mb-4 rounded-3xl bg-butter-50 p-4">
              <p className="text-sm text-espresso-700">
                <span className="font-semibold">AI sees:</span> {imageSuggestion.whatISee}
              </p>
              <p className="mt-2 font-display text-base font-bold">{imageSuggestion.headline}</p>
              <p className="text-sm text-espresso-700">{imageSuggestion.description}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    form.setFieldsValue({ headline: imageSuggestion.headline, description: imageSuggestion.description });
                    setImageJobId(null);
                    message.success("AI text added to the form");
                  }}
                >
                  Use this text
                </Button>
                <Button size="small" type="text" onClick={() => setImageJobId(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <Button type="primary" htmlType="submit" block size="large" className="h-12 rounded-2xl" loading={isCreating}>
            Create ad
          </Button>
        </Form>
      </div>

      {/* Right: live preview + AI review */}
      <div className="flex flex-col gap-6">
        <div className="rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-espresso-800">Live preview</h2>
          <p className="mb-5 text-sm text-espresso-500">How your display ad will look.</p>

          <div className="overflow-hidden rounded-3xl border border-espresso-800/10">
            {imageUrl ? (
              <img src={imageUrl} alt="Chosen ad image" className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-butter-400">
                <span className="font-display text-2xl font-extrabold tracking-tight text-espresso-800">Your image here</span>
              </div>
            )}
            <div className="p-4">
              <p className={`font-display text-lg font-bold ${headline ? "text-espresso-800" : "text-espresso-300"}`}>
                {headline || "Your headline"}
              </p>
              <p className={`text-sm ${description ? "text-espresso-500" : "text-espresso-300"}`}>
                {description || "Your description shows up here as you type."}
              </p>
              <span className="mt-3 inline-block rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">Sponsored</span>
            </div>
          </div>
        </div>

        {/* Idea 3 result */}
        {(isReviewing || review || reviewJob?.status === "failed") && (
          <div className="rounded-4xl border border-sage-100 bg-white p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-espresso-800">AI check</h2>

            {isReviewing && (
              <div className="flex items-center gap-2 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-700">
                <Spin size="small" /> {reviewJob?.message ?? "Sending the text to the AI..."}
              </div>
            )}
            {reviewJob?.status === "failed" && (
              <Alert type="error" showIcon message={reviewJob.message} closable onClose={() => setReviewJobId(null)} />
            )}
            {review && (
              <div>
                <div className="flex items-center gap-4">
                  <Progress
                    type="circle"
                    size={72}
                    percent={review.score * 10}
                    strokeColor={review.approved ? "#7E9147" : "#FDA769"}
                    format={() => <span className="font-display text-xl font-bold text-espresso-800">{review.score}</span>}
                  />
                  <div>
                    <p className="font-display text-lg font-bold">{review.approved ? "Looks good" : "Can be better"}</p>
                    <p className="text-sm text-espresso-500">Score {review.score} of 10</p>
                  </div>
                </div>

                {[...review.ruleIssues, ...review.aiIssues].length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {[...review.ruleIssues, ...review.aiIssues].map((issue) => (
                      <li key={issue} className="rounded-2xl bg-apricot-100 px-3 py-2 text-apricot-700">
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 rounded-3xl bg-sage-50 p-4">
                  <p className="text-xs font-semibold text-sage-700">Better version</p>
                  <p className="mt-1 font-display text-base font-bold">{review.improvedHeadline}</p>
                  <p className="text-sm text-espresso-700">{review.improvedDescription}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        form.setFieldsValue({ headline: review.improvedHeadline, description: review.improvedDescription });
                        setReviewJobId(null);
                        message.success("Improved text added to the form");
                      }}
                    >
                      Use improved text
                    </Button>
                    <Button size="small" type="text" onClick={() => setReviewJobId(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAdForm;
