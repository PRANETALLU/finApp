"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <header>
      <div>
        <Link href="/">💰 MyFinance</Link>
      </div>

      <nav>
        <Link href="/transactions">Transactions</Link>
        <Link href="/budget">Budgeting</Link>
        <Link href="/reports">Reports</Link>
      </nav>
    </header>
  );
};

export default Header;
