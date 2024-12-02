import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProcessingStatus } from "@/components/processing-status";
import { MenuVideoPlayer } from "@/components/menu-video-player";
import { redirect } from "next/navigation";

export default async function MenuPage({
  params
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/auth/signin");
  }

  const menu = await prisma.menu.findUnique({
    where: {
      id: params.id,
      userId: currentUser.id
    },
    include: {
      menuItems: {
        select: {
          id: true,
          name: true,
          description: true,
          synthesizedUrl: true,
        }
      }
    }
  });

  if (!menu) {
    redirect("/");
  }

  const isProcessing = ["PENDING", "PROCESSING_IMAGES", "PROCESSING_VIDEOS", "PROCESSING_AUDIO", "PROCESSING_SYNTHESIS"].includes(menu.status);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Menu Preview</h1>

      {isProcessing ? (
        <ProcessingStatus menuId={menu.id} />
      ) : menu.status === "COMPLETED" ? (
        <MenuVideoPlayer menuItems={menu.menuItems} />
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Processing failed: {menu.error}
        </div>
      )}
    </div>
  );
} 