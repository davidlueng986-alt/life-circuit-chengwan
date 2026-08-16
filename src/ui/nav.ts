export interface NavMark {
  x: number;
  z: number;
  kind: "self" | "goal" | "item" | "talk";
}

export function drawMinimap(
  canvas: HTMLCanvasElement,
  marks: NavMark[],
  yaw: number,
): void {
  const g = canvas.getContext("2d");
  if (!g) return;
  const w = canvas.width;
  const h = canvas.height;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(8, 16, 22, 0.82)";
  g.beginPath();
  g.rect(1, 1, w - 2, h - 2);
  g.fill();
  g.strokeStyle = "rgba(224, 160, 58, 0.65)";
  g.lineWidth = 2;
  g.strokeRect(1, 1, w - 2, h - 2);

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const mark of marks) {
    minX = Math.min(minX, mark.x);
    maxX = Math.max(maxX, mark.x);
    minZ = Math.min(minZ, mark.z);
    maxZ = Math.max(maxZ, mark.z);
  }
  if (!Number.isFinite(minX)) {
    minX = -8;
    maxX = 8;
    minZ = -8;
    maxZ = 8;
  }
  const pad = 3.5;
  minX -= pad;
  maxX += pad;
  minZ -= pad;
  maxZ += pad;
  const span = Math.max(maxX - minX, maxZ - minZ, 8);

  const toXY = (x: number, z: number): { x: number; y: number } => ({
    x: ((x - (minX + maxX) * 0.5) / span + 0.5) * (w - 16) + 8,
    y: ((z - (minZ + maxZ) * 0.5) / span + 0.5) * (h - 16) + 8,
  });

  for (const mark of marks) {
    const p = toXY(mark.x, mark.z);
    if (mark.kind === "self") continue;
    g.beginPath();
    if (mark.kind === "goal") {
      g.save();
      g.shadowColor = "#ff7a28";
      g.shadowBlur = 16;
      g.fillStyle = "rgba(255, 122, 40, 0.28)";
      g.arc(p.x, p.y, 11, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.fillStyle = "#ff7a28";
      g.moveTo(p.x, p.y - 7);
      g.lineTo(p.x + 6, p.y + 6);
      g.lineTo(p.x - 6, p.y + 6);
      g.closePath();
      g.fill();
      g.restore();
    } else if (mark.kind === "talk") {
      g.fillStyle = "#ffe2a0";
      g.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      g.fill();
    } else {
      g.fillStyle = "#8fd4cf";
      g.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      g.fill();
    }
  }

  const self = marks.find((mark) => mark.kind === "self");
  const px = self ? toXY(self.x, self.z).x : w * 0.5;
  const py = self ? toXY(self.x, self.z).y : h * 0.5;
  g.save();
  g.translate(px, py);
  g.rotate(-yaw);
  g.fillStyle = "#fff4d6";
  g.beginPath();
  g.moveTo(0, -7);
  g.lineTo(4.5, 6);
  g.lineTo(0, 3);
  g.lineTo(-4.5, 6);
  g.closePath();
  g.fill();
  g.restore();
}
