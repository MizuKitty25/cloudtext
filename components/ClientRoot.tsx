"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function getInitialTheme() {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserProfile = async () => {
  const { data } = await supabase.auth.getUser();
  setUser(data.user);

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, username")
      .eq("id", data.user.id)
      .single();

    setAvatar(profile?.avatar_url ?? null);
    setUsername(profile?.username ?? null);
  }
};

  useEffect(() => {
  fetchUserProfile();

  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    setMenuOpen(false);
    fetchUserProfile();
  });

  return () => listener.subscription.unsubscribe();
}, []);

useEffect(() => {
  const handleProfileUpdate = () => {
    fetchUserProfile();
  };

  window.addEventListener("profile-updated", handleProfileUpdate);

  return () =>
    window.removeEventListener("profile-updated", handleProfileUpdate);
}, []);


  useEffect(() => {
    setMenuOpen(false); // close menu whenever user changes
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  if (!mounted) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 transition-colors">
      <header className="w-full px-8 py-4 bg-white shadow flex items-center justify-between">
        <span className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <img src="/icon.png" alt="CloudText Icon" className="w-7 h-7" />
          CloudText
        </span>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          <Link href="/notes" className="text-gray-700 hover:text-blue-600">Notes</Link>

          {user ? (
            <div className="relative inline-block">
              <img
                src={avatar || "/default-avatar.jpg"}
                className="w-9 h-9 rounded-full cursor-pointer border hover:ring-2 hover:ring-blue-400 transition"
                onClick={() => setMenuOpen(!menuOpen)}
              />

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow rounded border overflow-hidden">
                  <div className="px-4 py-3 border-b text-sm text-gray-600">
                    Hi{username ? `, ${username}` : ""}!
                  </div>

                  <button
                    onClick={() => router.push("/profile")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4">{children}</main>

      <footer className="w-full py-4 text-center text-gray-400 text-sm border-t border-zinc-200">
        © 2026 CloudText
      </footer>
    </div>
  );
}