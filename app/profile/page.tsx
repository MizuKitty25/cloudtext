"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropUtils";
import type { Area } from "react-easy-crop";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const router = useRouter();

  const saveProfile = async (newUsername?: string, newAvatarUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User not logged in");

    const profileData: { id: string; username?: string; avatar_url?: string } = { id: user.id };
    if (newUsername !== undefined) profileData.username = newUsername;
    if (newAvatarUrl !== undefined) profileData.avatar_url = newAvatarUrl;

   const { error } = await supabase
  .from("profiles")
  .upsert(profileData); // remove { returning: "minimal" }

    if (error) {
      console.error("Failed to upsert profile:", error);
      alert("Failed to update profile: " + error.message);
    } else {
      if (newAvatarUrl) setAvatarUrl(newAvatarUrl);
      if (newUsername) setUsername(newUsername);
      alert("Profile updated successfully!");

      window.dispatchEvent(new Event("profile-updated"));
      
    }
  };
useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);

    // ✅ wait for session restoration
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth/login");
      setLoading(false);
      return;
    }

    const user = session.user;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
    }

    setUsername(profile?.username || "");
    setAvatarUrl(profile?.avatar_url || null);

    setLoading(false);
  };

  fetchProfile();
}, [router]);

  const onCropComplete = useCallback(
  (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  },
  []
);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    const croppedBlob = await getCroppedImg(
      URL.createObjectURL(selectedFile),
      croppedAreaPixels
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User not logged in");

    // Ensure profile row exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existing) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id });
      if (insertError) {
        console.error("Failed to insert empty profile row:", insertError);
        alert("Failed to create profile row: " + insertError.message);
        return;
      }
    }

    // Upload image to storage
    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, croppedBlob, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      alert("Upload failed: " + uploadError.message);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update avatar URL
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    await saveProfile(undefined, publicUrl);    

    setAvatarUrl(publicUrl);
    setSelectedFile(null);
  };

  const handleSaveUsername = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await saveProfile(username);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Profile Pic */}
      <img
        src={avatarUrl || "/default-avatar.jpg"}
        alt="Avatar"
        className="w-32 h-32 rounded-full object-cover border"
      />

      {/* File Upload Button */}
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
        {selectedFile ? "Change Image" : "Choose Image"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>

      {/* Cropper */}
      {selectedFile && (
        <div className="relative w-full h-64 mt-4 bg-gray-200 rounded overflow-hidden">
          <Cropper
            image={URL.createObjectURL(selectedFile)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <button
            onClick={handleUpload}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm transition"
          >
            Upload Image
          </button>
        </div>
      )}

      {/* Username */}
      <div className="w-full">
        <label className="block mb-1 text-gray-700">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button
          onClick={handleSaveUsername}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Username
        </button>
      </div>
    </div>
  );
}