"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import Card from "../../components/Card";
import type { Session } from "@supabase/supabase-js";

type Note = {
  id: string;
  title: string;
  content: string;
  inserted_at: string;
};

export default function NotesPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const userId = useMemo(() => session?.user?.id, [session]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      subscription = listener.subscription;
    };

    init();

    return () => subscription?.unsubscribe();
  }, []);

  const fetchNotes = async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
  .from("notes")
  .select("id,title,content,inserted_at,user_id")
  .eq("user_id", userId)
  .order("inserted_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else if (data) {
      setNotes(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNotes([]);
      return;
    }
    fetchNotes();
  }, [userId]);

  const openModal = (note?: Note) => {
    setEditingNote(note ?? null);
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    if (editingNote) {
      const { error } = await supabase
        .from("notes")
        .update({ title: title.trim(), content: content.trim() })
        .eq("id", editingNote.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("notes").insert([
        {
          user_id: userId,
          title: title.trim(),
          content: content.trim(),
        },
      ]);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    await fetchNotes();
    closeModal();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setNotes(prev => prev.filter(note => note.id !== id));
    setLoading(false);
  };

  if (session === undefined) {
    return (
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900">Notes</h1>
        <p className="text-zinc-700">Loading your notes…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 bg-white rounded shadow">
        <h1 className="text-3xl font-bold mb-4 text-zinc-900">Notes</h1>
        <p className="text-zinc-700 mb-4">You must be logged in to use notes.</p>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white rounded shadow">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Notes</h1>
          <p className="text-sm text-gray-600">Create, edit, and manage your notes.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New note
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600">No notes yet. Create your first note using the button above.</p>
          </Card>
        ) : (
          notes.map(note => (
            <Card key={note.id} className="relative">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(note)}
                    className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                {new Date(note.inserted_at).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {editingNote ? "Edit note" : "New note"}
                </h2>
                <p className="text-sm text-gray-600">
                  {editingNote
                    ? "Update your note and save your changes."
                    : "Write a title and some text, then save the note."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Give your note a title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]"
                  placeholder="Write your note here..."
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving…" : editingNote ? "Save changes" : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
