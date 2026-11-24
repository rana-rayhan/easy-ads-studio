import { useTranslation } from "react-i18next";
import { CheckOutlined } from "@ant-design/icons";

import { PASSWORD_RULES } from "../constants/password";

// Live checklist: each rule turns into a green pill with a tick when the typed password meets it.
const PasswordRequirements = ({ value = "" }: { value?: string }) => {
  const { t } = useTranslation();

  return (
    <ul className="-mt-2 mb-5 flex flex-wrap gap-1.5" aria-label="Password rules">
      {PASSWORD_RULES.map(({ key, test }) => {
        const passed = test(value);
        return (
          <li
            key={key}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              passed ? "bg-sage-100 text-sage-700" : "bg-espresso-800/5 text-espresso-500"
            }`}
          >
            {passed && <CheckOutlined aria-hidden="true" />}
            {t(`register.passwordRules.${key}`)}
            <span className="sr-only">{passed ? "(done)" : "(not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirements;
