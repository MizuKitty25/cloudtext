"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function getInitialTheme() {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Only run this once, on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  // Sync theme changes to <html> and localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  if (!mounted) {
    // Prevent rendering until mounted to avoid hydration mismatch
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
      <header className="w-full px-8 py-4 bg-white dark:bg-zinc-900 shadow flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">CloudText</span>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <Link href="/notes" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">Notes</Link>
          <Link href="/auth/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">Login</Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-4 px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">{children}</main>
      <footer className="w-full py-4 text-center text-gray-400 dark:text-gray-500 text-sm border-t border-zinc-200 dark:border-zinc-800">© 2026 CloudText</footer>
    </div>
  );
}