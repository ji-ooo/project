import { useState } from "react";
import "./App.scss";
import { Route, Routes, Navigate } from "react-router-dom";
import useThemeStore from "./shared/store/ThemeStore";
import Layout from "./shared/components/layout/Layout";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import GlitchRace from "./pages/glitchRace/GlitchRace";
import NotFound from "./pages/notFound/NotFound";

function App() {
  const { theme } = useThemeStore();

  return (
    <>
      <div className={`theme ${theme}`}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/glitchrace" element={<GlitchRace />} />
            <Route path="/notfound" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/notfound" />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
