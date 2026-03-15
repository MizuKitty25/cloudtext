import { Area } from "react-easy-crop";

export const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  const img = new Image();
  img.src = imageSrc;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Cannot get canvas context");

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(blob => {
        if (blob) resolve(blob);
      }, "image/jpeg");
    };
    img.onerror = reject;
  });
};