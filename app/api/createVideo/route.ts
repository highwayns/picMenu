import { NextResponse } from "next/server";
import RunwayML from '@runwayml/sdk';
import { prisma } from "@/lib/prisma";
import { generateDescription, generateSpeech } from "@/lib/openai";
import { synthesizeVideoWithAudio } from "@/lib/video-synthesis";

export async function POST(request: Request) {
  try {
    const { menuId } = await request.json();

    // 获取菜单项
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { menuItems: true },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    // 更新菜单状态为处理视频中
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'PROCESSING_VIDEOS' },
    });

    // 处理视频生成
    const videoResults = await Promise.allSettled(
      menu.menuItems.map(async (item) => {
        // ... 视频生成代码 ...
      })
    );

    // 更新菜单状态为处理音频中
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'PROCESSING_AUDIO' },
    });

    // 处理音频生成
    const audioResults = await Promise.allSettled(
      menu.menuItems.map(async (item) => {
        try {
          // 生成描述
          const description = await generateDescription(item.name);
          
          // 生成语音
          const speechBuffer = await generateSpeech(description);
          
          // 上传到S3
          const audioUrl = await uploadToS3(
            speechBuffer,
            `${item.name.toLowerCase().replace(/\s+/g, '-')}.mp3`,
            'audio/mpeg'
          );

          // 更新菜单项
          await prisma.menuItem.update({
            where: { id: item.id },
            data: {
              description,
              audioUrl,
            },
          });

          return {
            itemId: item.id,
            success: true,
            audioUrl,
          };
        } catch (error) {
          console.error(`Error processing audio for ${item.name}:`, error);
          return {
            itemId: item.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // 更新菜单状态为合成处理中
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'PROCESSING_SYNTHESIS' },
    });

    // 处理视频合成
    const synthesisResults = await Promise.allSettled(
      menu.menuItems.map(async (item) => {
        try {
          if (!item.animationUrl || !item.audioUrl) {
            throw new Error("Missing video or audio URL");
          }

          const synthesizedUrl = await synthesizeVideoWithAudio(
            item.animationUrl,
            item.audioUrl,
            `${item.name.toLowerCase().replace(/\s+/g, '-')}-final`
          );

          // 更新菜单项
          await prisma.menuItem.update({
            where: { id: item.id },
            data: {
              synthesizedUrl,
            },
          });

          return {
            itemId: item.id,
            success: true,
            synthesizedUrl,
          };
        } catch (error) {
          console.error(`Error processing synthesis for ${item.name}:`, error);
          return {
            itemId: item.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    // 更新菜单状态为完成
    await prisma.menu.update({
      where: { id: menuId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      menuId,
      videoResults,
      audioResults,
      synthesisResults,
    });

  } catch (error) {
    console.error("Error in processing:", error);
    
    // 更新菜单状态为失败
    await prisma.menu.update({
      where: { id: menuId },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      { success: false, error: "Processing failed" },
      { status: 500 }
    );
  }
}
