export default function getCroppedImage(
  image: HTMLImageElement,
  crop: { [key: string]: any },
  fileName: string,
  fileUrl: string
) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx!.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
      }
      window.URL.revokeObjectURL(fileUrl);
      const newFileUrl = window.URL.createObjectURL(blob);
      resolve(newFileUrl);
    }, 'image/jpeg');
  });
}
