import { useState } from "react";
import "./Layout.module.scss";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import ThemeSwitcher from "./ThemeSwitcher";

function Layout() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Layout;
