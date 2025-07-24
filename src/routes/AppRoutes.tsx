import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PATHS } from "./path";
import Login from "../pages/Login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Login />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
