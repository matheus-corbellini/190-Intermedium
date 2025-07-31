import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PATHS } from "./path";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ZeladorDashboard from "../pages/ZeladorDashboard/ZeladorDashboard";
import ProtectedRoute from "./ProtectedRoute";
import GerenteDashboard from "../pages/GerenteDashboard/GerenteDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Login />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        <Route
          path={PATHS.DASHBOARD_ZELADOR}
          element={
            <ProtectedRoute>
              <ZeladorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.DASHBOARD_GERENTE}
          element={
            <ProtectedRoute>
              <GerenteDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
