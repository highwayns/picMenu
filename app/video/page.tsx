"use client";

export default function VideoPage() {
  // ... existing imports and state ...

  const fetchMenuVideos = async () => {
    if (!menuId) return;
    
    setProcessingState({ status: "loading", progress: 0 });
    
    try {
      const response = await fetch(`/api/getMenuVideos?menuId=${menuId}&userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch menu videos");
      }
      
      const data = await response.json();
      
      if (data.status === 'PROCESSING_VIDEOS') {
        setProcessingState({
          status: "processing",
          progress: 50,
        });
        // 轮询检查状态
        setTimeout(fetchMenuVideos, 5000);
        return;
      }
      
      if (data.status === 'COMPLETED') {
        setMenuItems(data.menu);
        setProcessingState({ status: "success", progress: 100 });
      }
    } catch (error) {
      setProcessingState({
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // ... rest of the component
} 