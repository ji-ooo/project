import { useState } from "react";
import "./App.scss";
import { Route, Routes, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Layout from "./shared/components/layout/Layout";
import useThemeStore from "./store/ThemeStore";
// import ThemeSwitcher from "./shared/components/layout/ThemeSwitcher";

function App() {
  const { theme } = useThemeStore();

  return (
    <>
      <div className={`theme ${theme}`}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="/notfound" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/notfound" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
