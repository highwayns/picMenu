"use client";

import { useState, useEffect } from "react";

interface ProcessingStatusProps {
  menuId: string;
  onComplete?: (synthesizedUrls: string[]) => void;
}

export function ProcessingStatus({ menuId, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<string>("PENDING");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/menu/${menuId}/status`);
        const data = await response.json();

        setStatus(data.status);
        
        // 计算进度
        switch (data.status) {
          case "PROCESSING_IMAGES":
            setProgress(20);
            break;
          case "PROCESSING_VIDEOS":
            setProgress(40);
            break;
          case "PROCESSING_AUDIO":
            setProgress(60);
            break;
          case "PROCESSING_SYNTHESIS":
            setProgress(80);
            break;
          case "COMPLETED":
            setProgress(100);
            if (onComplete && data.menuItems) {
              onComplete(data.menuItems.map((item: any) => item.synthesizedUrl).filter(Boolean));
            }
            break;
          case "FAILED":
            setError(data.error || "Processing failed");
            break;
        }
      } catch (error) {
        setError("Failed to fetch status");
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [menuId, onComplete]);

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Processing Status: {status.replace(/_/g, " ")}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-500">
        {status === "PROCESSING_IMAGES" && "Generating images..."}
        {status === "PROCESSING_VIDEOS" && "Creating animations..."}
        {status === "PROCESSING_AUDIO" && "Generating audio descriptions..."}
        {status === "PROCESSING_SYNTHESIS" && "Combining video and audio..."}
        {status === "COMPLETED" && "Processing complete!"}
      </div>
    </div>
  );
} 