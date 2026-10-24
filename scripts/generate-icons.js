import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#g)"/>
  <rect x="140" y="104" width="232" height="304" rx="28" fill="#ffffff"/>
  <path d="M292 104 h48 v64 l-24 -20 l-24 20 Z" fill="#fbbf24"/>
  <rect x="172" y="212" width="168" height="22" rx="11" fill="#059669" opacity="0.9"/>
  <rect x="172" y="260" width="168" height="22" rx="11" fill="#059669" opacity="0.55"/>
  <rect x="172" y="308" width="116" height="22" rx="11" fill="#059669" opacity="0.35"/>
</svg>`

const outDir = path.resolve(process.cwd(), "public")
await mkdir(outDir, { recursive: true })

const buffer = Buffer.from(svg)

await sharp(buffer).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"))
await sharp(buffer).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"))
await sharp(buffer).resize(180, 180).png().toFile(path.join(outDir, "apple-icon.png"))

console.log("Icons generated in", outDir)
