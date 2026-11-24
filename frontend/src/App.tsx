import { RouterProvider } from "react-router/dom";
import router from "./routers/customRouter";

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
