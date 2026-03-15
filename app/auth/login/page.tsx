"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // ✅ login success
    setSuccess("Login successful! Redirecting to home...");

    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white dark:bg-zinc-900 rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
        Login
      </h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>

      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <a
          href="/auth/signup"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}