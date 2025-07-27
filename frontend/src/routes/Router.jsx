import { createBrowserRouter } from "react-router-dom";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import ForgotPassword from "@/pages/ForgotPassword";
import MyBorrowRequests from "@/pages/MyBorrowRequests";
import NOtFound from "@/pages/NOTFound";
import ResetPassword from "@/pages/resetPassword"; // if you use it, otherwise remove

// Dashboard Screens
import HomeDashboard from "@/screens/dashboard/HomeDashboard";
import Users from "@/screens/dashboard/User";
import AllItems from "@/screens/dashboard/AllItems";
import AddItem from "@/screens/dashboard/AddItem";
import BorrowRequest from "@/screens/dashboard/BorrowRequest";

// Manufacturer Screens
import AddBrands from "@/screens/dashboard/manufacturer/AddBrands";
import Brands from "@/screens/dashboard/manufacturer/Brands";

// Location Screens
import Location from "@/screens/dashboard/locations/Location";
import AddLocation from "@/screens/dashboard/locations/AddLocation";

// Layout & Route Guards
import DashboardLayout from "@/layout/DashboardLayout";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/my-request", element: <MyBorrowRequests /> },

  // Dashboard routes (protected)
  {
    path: "/dashboard",
    element: (
      <ProtectedAdminRoute>
        <DashboardLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      { path: "home", element: <HomeDashboard /> },
      { path: "users", element: <Users /> },
      { path: "all-items", element: <AllItems /> },
      { path: "add-item", element: <AddItem /> },
      { path: "borrow-request", element: <BorrowRequest /> },

      // Manufacturer management
      { path: "add-brands", element: <AddBrands /> },
      { path: "brands", element: <Brands /> },

      // Location management
      { path: "locations", element: <Location /> },
      { path: "add-locations", element: <AddLocation /> },
    ],
  },

  // Catch all (404)
  { path: "*", element: <NOtFound /> },
]);

export default router;
