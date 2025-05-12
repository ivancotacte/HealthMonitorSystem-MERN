import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Register from "@/pages/Register";

const Routes = () => {
    const routesForPublic = [
        { path: "/register", element: <Register /> },
    ];

    const router = createBrowserRouter([
        ...routesForPublic,
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;