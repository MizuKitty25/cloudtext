"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import Card from "../../components/Card";
import type { Session } from "@supabase/supabase-js";

type Note = {
  id: string;
  title: string;
  content: string;
  inserted_at: string;
  updated_at: string;
  pinned: boolean;
};

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    init();
  }, []);

  const fetchNotes = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("id,title,content,inserted_at,updated_at,pinned")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5);

    if (data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotes(session.user.id);
    }
  }, [session]);

  if (session === undefined) {
    return (
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900">Dashboard</h1>
        <p className="text-zinc-700">Loading your dashboard…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900">Dashboard</h1>
        <p className="text-zinc-700 mb-4">You must be logged in to view your dashboard.</p>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Sign up
          </Link>
        </div>
      </Card>
    );
  }

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter(n => n.pinned).length;

  return (
    <div className="space-y-6">
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900">Dashboard</h1>
        <p className="text-zinc-700 mb-6">Quick overview of your notes.</p>

        <div className="flex gap-4 mb-6">
          <Card className="flex-1 p-4 text-center">
            <h2 className="text-xl font-semibold">{totalNotes}</h2>
            <p className="text-gray-600">Total Notes</p>
          </Card>
          <Card className="flex-1 p-4 text-center">
            <h2 className="text-xl font-semibold">{pinnedNotes}</h2>
            <p className="text-gray-600">Pinned Notes</p>
          </Card>
          <Card className="flex-1 p-4 text-center">
            <Link
              href="/notes"
              className="inline-block mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Note
            </Link>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-zinc-900">Recent Notes</h2>
        {loading ? (
          <p className="text-gray-600">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-600">No notes yet.</p>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <Card key={note.id} className="p-4">
                <h3 className="font-semibold text-gray-900">{note.title}</h3>
                <p className="text-gray-700 truncate">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last edited {new Date(note.updated_at).toLocaleString()}
                  {note.pinned && " • 📌 Pinned"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}