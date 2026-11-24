import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router";

const ErrorPage = ({ title = "Back to Home", link = "/login" }: { title?: string; link?: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <SearchOutlined className="mb-3 text-4xl text-gray-400" />

        <h1 className="text-5xl font-bold text-gray-700">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-800">Page Not Found</h2>

        <p className="mt-2 text-sm text-gray-500">Sorry, the page you're looking for doesn't exist.</p>

        <Link
          to={link}
          className="mt-5 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <HomeOutlined className="mr-2" />
          {title}
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
