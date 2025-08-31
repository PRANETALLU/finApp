// src/app/ClientLayout.js
"use client";

import { useUser } from "@/app/context/UserContext";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot"; 

export default function ClientLayout({ children }) {
  const { user } = useUser();

  return (
    <>
      {user && <Navbar />}
      <main>{children}</main>
      {user && <Chatbot />}
    </>
  );
}
