import { useState } from "react";
import "./NavBar.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
function NavBar() {
  return (
    <div>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <ThemeSwitcher />
      </nav>
    </div>
  );
}

export default NavBar;
