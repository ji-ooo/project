import { useState } from "react";
import styles from "./Layout.module.scss";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";

function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Header />
      </header>
      <aside className={styles.aside}>
        <SideBar />
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
