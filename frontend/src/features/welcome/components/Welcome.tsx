import { Link } from "react-router";

const Welcome = () => {
  const loggedUserRole = "user";

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Welcome to template Project Course SW3</h1>

      <p className="mb-6 text-gray-600">Explore our simple template application demo.</p>

      <Link
        to={`/${loggedUserRole}/list`}
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
      >
        View Demo User List
      </Link>
    </div>
  );
};

export default Welcome;
