"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function isValidPassword(pw: string) {
    // At least one letter and one number, min 6 chars
    return /[A-Za-z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 6;
  }

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (!isValidPassword(password)) {
    setError("Password must be at least 6 characters and contain both a letter and a number.");
    return;
  }

  setLoading(true);

 const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`,
  },
});
  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }
  setLoading(false);
  setSuccess("Signup successful! Please check your email to verify your account.");

};

  return (
    <div className="p-8 max-w-md mx-auto bg-white dark:bg-zinc-900 rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
    </div>
  );
}
