import { Link } from "react-router";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";

const ForbiddenPage = ({ statusCode = 403 }: { statusCode?: number }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <LockOutlined className="mb-3 text-4xl text-red-500" />

        <h1 className="text-5xl font-bold text-red-500">{statusCode}</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Access Forbidden</h2>

        <p className="mt-2 text-sm text-gray-500">You don't have permission to access this page.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
            <HomeOutlined className="mr-2" />
            Home
          </Link>

          <Link
            to="/login"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
