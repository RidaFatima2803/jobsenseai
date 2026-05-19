"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // ✅ Load saved data on page load
  useEffect(() => {
    const savedProfile = localStorage.getItem("profile");

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);

      setProfile({
        name: parsedProfile.name || "",
        email: parsedProfile.email || "",
      });
    }
  }, []);

  // ✅ Save data properly
  const handleSave = () => {
    localStorage.setItem("profile", JSON.stringify(profile));
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* ✅ FIXED: Go to landing page */}
        <Button onClick={() => router.push("/")}>
          Go to Home
        </Button>
      </div>

      {/* PROFILE SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Profile & Account Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
          />

          <Input
            placeholder="Email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}