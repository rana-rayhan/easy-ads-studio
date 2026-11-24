import { message } from "antd";
import axios from "axios";

import i18n from "../../i18n";
import { customConsoleLogForDev } from "../logHelpers/logger";

const translateMessage = (key: string): string => {
  if (i18n.exists(key)) return i18n.t(key);
  return i18n.t("common.unexpectedError");
};

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const apiMessage = error.response?.data?.message;

    if (apiMessage) return message.error(translateMessage(apiMessage));
    return message.error(i18n.t("common.unexpectedError"));
  }

  message.error(i18n.t("common.unexpectedError"));
  customConsoleLogForDev(error);
};
