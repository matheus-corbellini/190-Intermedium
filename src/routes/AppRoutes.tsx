import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PATHS } from "./path";

const Home = () => <div>Página inicial (esqueleto)</div>;

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.HOME} element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
