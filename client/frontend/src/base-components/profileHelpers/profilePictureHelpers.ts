export function getCroppedImage(
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

export async function imageURLToFile(
  imageURL: string,
  callback: (data: string | ArrayBuffer | null) => any
) {
  const imageBlob = await fetch(imageURL).then((res) => res.blob());
  const reader = new FileReader();

  reader.onload = () => {
    const arrayBuffer = reader.result;
    callback(arrayBuffer);
  };

  reader.readAsDataURL(imageBlob);
}

//Resource - https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata#answer-5100158

export function imageURLToBlob(imageURL: string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (imageURL.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(imageURL.split(',')[1]);
  else byteString = unescape(imageURL.split(',')[1]);

  // separate out the mime component
  var mimeString = imageURL
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
