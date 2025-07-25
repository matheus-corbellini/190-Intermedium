import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PATHS } from "./path";
import Login from "../pages/Login";
import Register from "../pages/Register";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Login />} />
        <Route path={PATHS.LOGIN} element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
