"use client";

import { useState } from "react";

interface GenerateDescriptionButtonProps {
  menuItemId: string;
  onSuccess: (description: string, audioUrl: string) => void;
}

export function GenerateDescriptionButton({
  menuItemId,
  onSuccess,
}: GenerateDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/menu-items/${menuItemId}/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      onSuccess(data.description, data.audioUrl);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Generating..." : "Generate Description & Audio"}
    </button>
  );
} 