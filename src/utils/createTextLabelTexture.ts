import { CanvasTexture } from "three";

const createTextLabelTexture = (text: string, fontSize: number) => {
  const canvas = document.createElement('canvas');
  const scale = window.devicePixelRatio; 
  const size = 150;
  canvas.width = Math.floor(size * scale);
  canvas.height = Math.floor(size * scale);
  const ctx = canvas.getContext('2d');
  if(!ctx) return;

  ctx.scale(scale, scale);

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const x = size / 2;
  const y = size / 2;
  ctx.fillStyle = "black";
  ctx.fillText(text, x, y);
  const texture = new CanvasTexture(canvas);
  return texture;
}

export default createTextLabelTexture;