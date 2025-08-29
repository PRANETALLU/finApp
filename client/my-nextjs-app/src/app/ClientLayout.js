// src/app/ClientLayout.js
"use client";

import { useUser } from "@/app/context/UserContext";
import Navbar from "./components/Navbar";

export default function ClientLayout({ children }) {
  const { user } = useUser();

  return (
    <>
      {user && <Navbar />}
      <main>{children}</main>
    </>
  );
}
