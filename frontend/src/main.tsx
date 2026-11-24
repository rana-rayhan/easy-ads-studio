import "./index.css";
import "@ant-design/v5-patch-for-react-19";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.tsx";
import { STAGE } from "./secrect.ts";
import { queryClient } from "./shared/utils/queryClient.ts";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {/* antd theme: the same colors as tailwind.config.js (sage, butter, apricot, espresso) */}
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#7E9147", // sage-600: links, focus, switches, selected items
          colorSuccess: "#7E9147",
          colorWarning: "#F5B640",
          colorError: "#D2553A",
          colorInfo: "#7E9147",
          colorText: "#473C33", // espresso-800
          colorTextSecondary: "#7A7268",
          colorBorder: "#E3E8CF",
          colorBgLayout: "#F8F9EE", // paper
          fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
          borderRadius: 12,
          controlHeight: 40,
        },
        components: {
          // Main buttons are butter yellow with espresso text, like the "Save" button in the design
          Button: {
            colorPrimary: "#FEC868",
            colorPrimaryHover: "#FED27D",
            colorPrimaryActive: "#F5B640",
            primaryColor: "#473C33",
            primaryShadow: "none",
            defaultShadow: "none",
            fontWeight: 600,
          },
          Input: { colorBgContainer: "#F4F6E8", activeBg: "#FFFFFF", hoverBg: "#FFFFFF" },
          InputNumber: { colorBgContainer: "#F4F6E8", activeBg: "#FFFFFF", hoverBg: "#FFFFFF" },
          Select: { colorBgContainer: "#F4F6E8" },
          Segmented: { itemSelectedBg: "#473C33", itemSelectedColor: "#FEC868", trackBg: "#F4F6E8" },
          Card: { borderRadiusLG: 24 },
          Modal: { borderRadiusLG: 24 },
          Table: { headerBg: "#F4F6E8" },
        },
      }}
    >
      <App />
    </ConfigProvider>
    {STAGE === "local" && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>,
);
