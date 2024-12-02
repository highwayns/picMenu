"use client";

import { useState } from "react";

interface MenuVideoPlayerProps {
  menuItems: {
    id: string;
    name: string;
    description: string;
    synthesizedUrl: string;
  }[];
}

export function MenuVideoPlayer({ menuItems }: MenuVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = menuItems[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % menuItems.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };

  if (!currentItem) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
        <video
          key={currentItem.synthesizedUrl}
          className="w-full aspect-video"
          controls
          autoPlay
          onEnded={handleNext}
        >
          <source src={currentItem.synthesizedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-bold text-gray-900">{currentItem.name}</h2>
        <p className="mt-2 text-gray-600">{currentItem.description}</p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Previous
        </button>
        <span className="text-gray-600">
          {currentIndex + 1} / {menuItems.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
} 