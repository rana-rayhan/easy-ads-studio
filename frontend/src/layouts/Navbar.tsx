import { useState } from "react";
import { Button, Drawer, Dropdown, Segmented } from "antd";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { LogoutOutlined, MenuOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import useAuth from "../features/auth/hooks/useAuth";
import useAuthHook from "../features/auth/hooks/useAuthHook";
import { hasRole } from "../shared/utils/hasRole";
import jobModeStorage from "../shared/storage/jobModeStorage";

// Sections of the dashboard page. The links scroll to them (the ids are set in Dashboard.tsx).
const SECTIONS = [
  { label: "AI studio", hash: "#ai-studio" },
  { label: "Create ad", hash: "#create-ad" },
  { label: "Jobs", hash: "#jobs" },
  { label: "Campaigns", hash: "#campaigns" },
];

// Layout shown on every page: header, the page content, and a footer.
const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, loggedUser, roles } = useAuth();
  const { logout } = useAuthHook();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // "Worker / Local" choice. Kept in the React Query cache, so the dashboard hero sees the same value.
  const { data: jobMode = "worker" } = useQuery({
    queryKey: ["jobMode"],
    queryFn: () => jobModeStorage.get(),
    staleTime: Infinity,
  });

  const onJobModeChange = (value: JobMode) => {
    jobModeStorage.save(value); // the axios instance sends it as the "X-Job-Mode" header
    queryClient.setQueryData(["jobMode"], value);
  };

  // Go to a dashboard section (works from other pages too)
  const goToSection = (hash: string) => {
    setIsMenuOpen(false);
    navigate(`/dashboard${hash}`);
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isSuperuser = hasRole(roles, ["superuser"]);
  const firstLetter = (loggedUser?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header: a white rounded bar that floats over the page */}
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-sage-100 bg-white/95 py-2 pl-3 pr-2 backdrop-blur">
          {/* Logo: a sprout (two leaves) on an espresso tile */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-espresso-800 ring-4 ring-sage-100">
              <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                <path d="M16 25v-9" className="stroke-paper" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M16 17c0-5 3.5-8.5 9-8.5 0 5.5-3.5 8.5-9 8.5Z" className="fill-sage-400" />
                <path d="M16 19c0-4-2.8-6.8-7.2-6.8 0 4.4 2.8 6.8 7.2 6.8Z" className="fill-butter-400" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-apricot-400 ring-2 ring-white" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-bold tracking-tight text-espresso-800">Easy Ads</span>
              <span className="block text-[11px] font-medium text-espresso-500">Studio</span>
            </span>
          </Link>

          {/* Desktop links (only when logged in) */}
          {isLoggedIn && (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Dashboard sections">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    isActive ? "bg-sage-100 text-sage-700" : "text-espresso-500 hover:text-espresso-800"
                  }`
                }
              >
                Dashboard
              </NavLink>
              {SECTIONS.map((section) => (
                <button
                  key={section.hash}
                  type="button"
                  onClick={() => goToSection(section.hash)}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-espresso-500 transition-colors hover:text-espresso-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
                >
                  {section.label}
                </button>
              ))}
              {isSuperuser && (
                <NavLink
                  to="/user/list"
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      isActive ? "bg-sage-100 text-sage-700" : "text-espresso-500 hover:text-espresso-800"
                    }`
                  }
                >
                  Users
                </NavLink>
              )}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Where jobs run (hidden on small screens, it is in the menu there) */}
                <div className="hidden items-center gap-2 md:flex">
                  <span className="text-xs font-medium text-espresso-500">Jobs run in</span>
                  <Segmented<JobMode>
                    size="small"
                    value={jobMode}
                    onChange={onJobModeChange}
                    options={[
                      { label: "Worker", value: "worker" },
                      { label: "Local", value: "local" },
                    ]}
                  />
                </div>

                {/* Account menu */}
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "email",
                        label: <span className="text-espresso-500">{loggedUser?.email}</span>,
                        disabled: true,
                      },
                      { type: "divider" },
                      { key: "logout", label: "Log out", icon: <LogoutOutlined />, danger: true, onClick: logout },
                    ],
                  }}
                >
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-apricot-400 font-display text-base font-bold text-white ring-4 ring-apricot-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage-600"
                  >
                    {firstLetter}
                  </button>
                </Dropdown>

                {/* Mobile menu button */}
                <Button
                  className="lg:hidden"
                  shape="circle"
                  icon={<MenuOutlined />}
                  aria-label="Open menu"
                  onClick={() => setIsMenuOpen(true)}
                />
              </>
            ) : (
              <>
                <Button type="text" className="font-semibold" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button type="primary" shape="round" onClick={() => navigate("/register")}>
                  Create account
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        placement="right"
        width={300}
        title={<span className="font-display text-lg font-bold">Menu</span>}
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              navigate("/dashboard");
            }}
            className="rounded-2xl px-4 py-3 text-left font-semibold text-espresso-800 hover:bg-sage-50"
          >
            Dashboard
          </button>
          {SECTIONS.map((section) => (
            <button
              key={section.hash}
              type="button"
              onClick={() => goToSection(section.hash)}
              className="rounded-2xl px-4 py-3 text-left font-medium text-espresso-700 hover:bg-sage-50"
            >
              {section.label}
            </button>
          ))}
          {isSuperuser && (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/user/list");
              }}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-left font-medium text-espresso-700 hover:bg-sage-50"
            >
              <TeamOutlined /> Users
            </button>
          )}
        </div>

        <div className="mt-6 rounded-3xl bg-sage-50 p-4">
          <p className="mb-2 text-sm font-semibold">Jobs run in</p>
          <Segmented<JobMode>
            block
            value={jobMode}
            onChange={onJobModeChange}
            options={[
              { label: "Worker", value: "worker" },
              { label: "Local", value: "local" },
            ]}
          />
          <p className="mt-2 text-xs text-espresso-500">
            Worker sends jobs through RabbitMQ. Local runs them in the API.
          </p>
        </div>
      </Drawer>

      {/* Page content. flex-1 pushes the footer to the bottom. */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-4 pb-6 pt-10">
        <p className="mx-auto max-w-6xl text-center text-xs text-espresso-400">
          © {new Date().getFullYear()} Easy Ads Studio. A learning project with React, Express, RabbitMQ and Ollama.
        </p>
      </footer>
    </div>
  );
};

export default Navbar;
