import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

import useAuthHook from "../hooks/useAuthHook";
import { createLoginSchema } from "../schemas/authSchema";
import { zodRule } from "../../../shared/utils/hasRole";

const Login = () => {
  const { t } = useTranslation();
  const { login, isLoggingIn } = useAuthHook();

  // Rebuild the schema when the language changes, so the messages follow the language.
  const schema = useMemo(() => createLoginSchema((key) => t(key)), [t]);

  const onFinish = (values: LoginFormType) => {
    // parse() applies the transforms (trim and lowercase the email) before sending.
    const result = schema.safeParse(values);
    if (result.success) login(result.data);
  };

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-sage-100 bg-white lg:grid-cols-2">
        {/* Left: sage panel with an ad being checked (hidden on small screens) */}
        <div className="relative hidden flex-col justify-between bg-sage-600 p-10 text-white lg:flex">
          <p className="font-display text-lg font-bold">Easy Ads Studio</p>

          {/* The ad card, the AI score and the job status */}
          <div className="relative mx-auto my-10 h-64 w-full max-w-xs">
            <div className="absolute inset-x-6 top-6 h-48 rotate-6 rounded-3xl bg-sage-500" />
            <div className="absolute inset-x-2 top-2 -rotate-3 overflow-hidden rounded-3xl bg-white text-espresso-800">
              <div className="flex h-28 items-center justify-center bg-butter-400">
                <span className="font-display text-2xl font-extrabold tracking-tight">Fresh coffee</span>
              </div>
              <div className="p-4">
                <p className="font-display text-base font-bold">Fresh coffee, 20% off</p>
                <p className="text-sm text-espresso-500">Start your day with our morning blend.</p>
              </div>
            </div>
            <span className="absolute -right-2 top-0 rounded-full bg-apricot-400 px-3 py-1 text-xs font-bold text-white">
              Done
            </span>
            <span className="absolute -left-3 bottom-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sage-700">
              AI score 8 of 10
            </span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">Write it, check it, ship it.</h2>
            <p className="mt-2 max-w-sm text-sage-100">
              A local AI writes and reviews your ads. Every job shows up live while a worker runs it.
            </p>
          </div>
        </div>

        {/* Right: the form */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <h1 className="font-display text-3xl font-bold text-espresso-800">{t("login.title")}</h1>
          <p className="mb-8 mt-1 text-espresso-500">{t("login.subtitle")}</p>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            validateTrigger="onBlur"
            requiredMark={false}
          >
            <Form.Item name="email" label={t("login.email")} rules={[zodRule(schema.shape.email)]} hasFeedback>
              <Input
                prefix={<MailOutlined className="text-espresso-400" />}
                placeholder={t("login.emailPlaceholder")}
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item name="password" label={t("login.password")} rules={[zodRule(schema.shape.password)]}>
              <Input.Password
                prefix={<LockOutlined className="text-espresso-400" />}
                placeholder={t("login.passwordPlaceholder")}
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="mt-2 h-12 rounded-2xl"
              loading={isLoggingIn}
            >
              {t("login.submit")}
            </Button>
          </Form>

          <p className="mt-6 text-center text-sm text-espresso-500">
            {t("login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-semibold text-sage-700 underline underline-offset-4 hover:text-sage-800"
            >
              {t("login.registerNow")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
