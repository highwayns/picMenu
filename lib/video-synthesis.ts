import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { downloadFile } from './download';
import { uploadToS3 } from './s3';

export async function synthesizeVideoWithAudio(
  videoUrl: string,
  audioUrl: string,
  outputFileName: string
): Promise<string> {
  // 下载视频和音频文件
  const videoBuffer = await downloadFile(videoUrl);
  const audioBuffer = await downloadFile(audioUrl);

  // 创建临时文件路径
  const tempVideoPath = `/tmp/${outputFileName}-video.mp4`;
  const tempAudioPath = `/tmp/${outputFileName}-audio.mp3`;
  const tempOutputPath = `/tmp/${outputFileName}-output.mp4`;

  // 写入临时文件
  await fs.promises.writeFile(tempVideoPath, videoBuffer);
  await fs.promises.writeFile(tempAudioPath, audioBuffer);

  // 合成视频和音频
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempVideoPath)
      .input(tempAudioPath)
      .outputOptions([
        '-c:v copy',
        '-c:a aac',
        '-shortest'
      ])
      .output(tempOutputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  // 读取合成后的文件
  const outputBuffer = await fs.promises.readFile(tempOutputPath);

  // 上传到S3
  const s3Url = await uploadToS3(
    outputBuffer,
    `${outputFileName}.mp4`,
    'video/mp4'
  );

  // 清理临时文件
  await Promise.all([
    fs.promises.unlink(tempVideoPath),
    fs.promises.unlink(tempAudioPath),
    fs.promises.unlink(tempOutputPath)
  ]);

  return s3Url;
} 