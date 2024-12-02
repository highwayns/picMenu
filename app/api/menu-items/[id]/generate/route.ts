import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDescription, generateSpeech } from "@/lib/openai";
import { uploadToS3 } from "@/lib/s3";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取菜单项
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { menu: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // 验证权限
    if (menuItem.menu.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 生成描述
    const description = await generateDescription(menuItem.name);

    // 生成语音
    const speechBuffer = await generateSpeech(description);

    // 上传到S3
    const audioUrl = await uploadToS3(
      speechBuffer,
      `${menuItem.name.toLowerCase().replace(/\s+/g, '-')}.mp3`,
      'audio/mpeg'
    );

    // 更新数据库
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        description,
        audioUrl,
      },
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
} 