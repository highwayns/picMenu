import RunwayML from '@runwayml/sdk';
import { prisma } from '@/lib/prisma';

const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

export async function POST(request: Request) {
  const { menuId } = await request.json();

  try {
    // 更新菜单状态
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'PROCESSING_VIDEOS' },
    });

    // 获取菜单项
    const menuItems = await prisma.menuItem.findMany({
      where: { menuId: menuId },
    });

    // 生成动画
    const animationPromises = menuItems.map(async (item) => {
      const animationUrl = await generateAndUploadAnimation(item);
      
      // 更新菜单项的动画URL
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { animationUrl },
      });

      return { ...item, animationUrl };
    });

    await Promise.all(animationPromises);

    // 更新菜单状态为完成
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'COMPLETED' },
    });

    return Response.json({ success: true, menuId });
  } catch (error) {
    console.error('Error generating videos:', error);
    await prisma.menu.update({
      where: { id: menuId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return Response.json({ error: "Failed to generate videos" }, { status: 500 });
  }
}
