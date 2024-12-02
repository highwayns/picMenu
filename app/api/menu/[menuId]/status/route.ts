import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { menuId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: { 
        id: params.menuId,
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
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: menu.status,
      error: menu.error,
      menuItems: menu.menuItems
    });

  } catch (error) {
    console.error("Error fetching menu status:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu status" },
      { status: 500 }
    );
  }
} 