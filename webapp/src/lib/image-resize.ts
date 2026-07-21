// 어떤 사진을 올려도 지정한 비율/크기로 고정해서 내보내는 유틸(중앙 크롭 방식).
// 클럽마다 사진 규격이 제각각이면 UI가 흐트러지므로, 업로드 전 클라이언트에서 통일함.
export async function resizeImageToCover(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality = 0.85
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("CANVAS_UNSUPPORTED");

    const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (targetWidth - w) / 2, (targetHeight - h) / 2, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) throw new Error("EXPORT_FAILED");
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
