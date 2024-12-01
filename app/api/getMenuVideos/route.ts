import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const menuId = searchParams.get('menuId');
  const userId = searchParams.get('userId');

  if (!menuId || !userId) {
    return Response.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        menuItems: true,
      },
    });

    if (!menu) {
      return Response.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu.userId !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json({
      menu: menu.menuItems,
      status: menu.status,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return Response.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
} 