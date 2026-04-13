import { useState } from "react";
import styles from "./Layout.module.scss";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import SideBar from "./SideBar";

function Layout() {
  return (
    <div>
      <div className={styles.navBarContainer}>
        <NavBar />
      </div>
      <div className={styles.sideBarContainer}>
        <SideBar />
      </div>
      <div className={styles.mainContainer}>
        <main className={styles.outlet}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
