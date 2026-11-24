import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Form, Input } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

import useAuthHook from "../hooks/useAuthHook";
import { createRegisterSchema } from "../schemas/authSchema";
import { zodFieldRule } from "../../../shared/utils/hasRole";
import PasswordRequirements from "./PasswordRequirements";

const Register = () => {
  const { t } = useTranslation();
  const { register, isRegistering } = useAuthHook();
  const [form] = Form.useForm();
  const passwordValue = Form.useWatch("password", form);

  // Rebuild the schema when the language changes, so the messages follow the language.
  const schema = useMemo(() => createRegisterSchema((key) => t(key)), [t]);

  const onFinish = (values: unknown) => {
    // parse() applies the transforms (trim names, lowercase email) before sending.
    const result = schema.safeParse(values);
    if (!result.success) return;

    // confirmPassword is only for checking in the form, it is not sent to the backend.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...userData } = result.data;

    register(userData);
  };

  return (
    <div className="px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl border border-sage-100 bg-white lg:grid-cols-[1fr_1.15fr]">
        {/* Left: sage panel with what you get (hidden on small screens) */}
        <div className="hidden flex-col justify-between bg-sage-600 p-10 text-white lg:flex">
          <p className="font-display text-lg font-bold">Easy Ads Studio</p>

          {/* What happens after you sign up, in order */}
          <ol className="my-10 space-y-4">
            <li className="flex items-center gap-4 rounded-3xl bg-sage-500 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-butter-400 font-display text-lg font-bold text-espresso-800">
                1
              </span>
              <span>
                <span className="block font-semibold">Get ad ideas</span>
                <span className="text-sm text-sage-100">Tell the AI your product and audience.</span>
              </span>
            </li>
            <li className="flex items-center gap-4 rounded-3xl bg-sage-500 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-butter-400 font-display text-lg font-bold text-espresso-800">
                2
              </span>
              <span>
                <span className="block font-semibold">Check before you send</span>
                <span className="text-sm text-sage-100">Get a score and a better version.</span>
              </span>
            </li>
            <li className="flex items-center gap-4 rounded-3xl bg-sage-500 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-apricot-400 font-display text-lg font-bold text-white">
                3
              </span>
              <span>
                <span className="block font-semibold">Create the ad</span>
                <span className="text-sm text-sage-100">Watch the job go from waiting to done.</span>
              </span>
            </li>
          </ol>

          <h2 className="font-display text-3xl font-bold leading-tight">Your first ad takes about a minute.</h2>
        </div>

        {/* Right: the form */}
        <div className="p-6 sm:p-10 lg:p-12">
          <h1 className="font-display text-3xl font-bold text-espresso-800">{t("register.title")}</h1>
          <p className="mb-8 mt-1 text-espresso-500">{t("register.subtitle")}</p>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            validateTrigger="onBlur"
            requiredMark={false}
          >
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item name="firstName" label={t("register.firstName")} rules={[zodFieldRule(schema, "firstName")]}>
                <Input
                  prefix={<UserOutlined className="text-espresso-400" />}
                  placeholder="Maya"
                  autoComplete="given-name"
                />
              </Form.Item>

              <Form.Item name="lastName" label={t("register.lastName")} rules={[zodFieldRule(schema, "lastName")]}>
                <Input
                  prefix={<UserOutlined className="text-espresso-400" />}
                  placeholder="Rodriguez"
                  autoComplete="family-name"
                />
              </Form.Item>
            </div>

            <Form.Item name="email" label={t("register.email")} rules={[zodFieldRule(schema, "email")]} hasFeedback>
              <Input
                prefix={<MailOutlined className="text-espresso-400" />}
                placeholder="name@company.com"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("register.password")}
              rules={[zodFieldRule(schema, "password")]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined className="text-espresso-400" />} autoComplete="new-password" />
            </Form.Item>
            <PasswordRequirements value={passwordValue} />

            {/* dependencies: re-check this field whenever the password changes */}
            <Form.Item
              name="confirmPassword"
              label={t("register.confirmPassword")}
              dependencies={["password"]}
              rules={[zodFieldRule(schema, "confirmPassword")]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined className="text-espresso-400" />} autoComplete="new-password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="mt-2 h-12 rounded-2xl"
              loading={isRegistering}
            >
              {t("register.submit")}
            </Button>
          </Form>

          <p className="mt-6 text-center text-sm text-espresso-500">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/login" className="font-semibold text-sage-700 underline underline-offset-4 hover:text-sage-800">
              {t("register.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
