import { useEffect } from "react";
import { Form } from "antd";
import { Link, useLocation } from "react-router";
import { PlusOutlined } from "@ant-design/icons";

import useAuth from "../../auth/hooks/useAuth";
import { GlobalLoading } from "../../components/Loading";
import CreateAdForm from "../../ads/components/CreateAdForm";
import AdJobTable from "../../ads/components/AdJobTable";
import GoogleCampaignPanel from "../../googleAds/components/GoogleCampaignPanel";
import AiCopyPanel from "../../ai/components/AiCopyPanel";
import DashboardHero from "./DashboardHero";

const Dashboard = () => {
  const { loggedUser, isLoggedIn, authLoading } = useAuth();
  const location = useLocation();
  // One form instance for "Create ad", shared with the AI panel so it can fill the form
  const [adForm] = Form.useForm<CreateAdFormValues>();

  // The navbar links go to /dashboard#create-ad and so on. Scroll to that section once the page is shown.
  useEffect(() => {
    if (!location.hash || !isLoggedIn) return;
    document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, isLoggedIn]);

  if (authLoading) return <GlobalLoading />;

  // No route guard, so show a login link here when logged out.
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-4xl font-bold text-espresso-800">Your ads start here</h1>
        <p className="max-w-md text-espresso-500">Log in to write ads with the AI, create them, and watch every job run.</p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-2xl bg-butter-400 px-6 py-3 font-semibold text-espresso-800 transition-colors hover:bg-butter-300"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-2xl border border-sage-200 bg-white px-6 py-3 font-semibold text-espresso-800 transition-colors hover:border-sage-400"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-6 sm:px-6">
      {/* scroll-mt: leave room for the sticky navbar when a link scrolls to a section */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <DashboardHero email={loggedUser?.email} />

        {/* Idea 1: AI writes ad text, a click copies it into the Create ad form below */}
        <section id="ai-studio" className="scroll-mt-28">
          <AiCopyPanel adForm={adForm} />
        </section>

        {/* Create ad (with ideas 2 and 3) and the live preview */}
        <section id="create-ad" className="scroll-mt-28">
          <CreateAdForm form={adForm} />
        </section>

        {/* Jobs and Google Ads campaigns side by side on big screens */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <section id="jobs" className="scroll-mt-28">
            <AdJobTable />
          </section>
          <section id="campaigns" className="scroll-mt-28">
            <GoogleCampaignPanel />
          </section>
        </div>
      </div>

      {/* Mobile: a big butter button that jumps to Create ad */}
      <a
        href="#create-ad"
        aria-label="Create ad"
        className="fixed bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-butter-400 text-xl text-espresso-800 ring-4 ring-paper transition-colors hover:bg-butter-300 lg:hidden"
      >
        <PlusOutlined />
      </a>
    </div>
  );
};

export default Dashboard;
