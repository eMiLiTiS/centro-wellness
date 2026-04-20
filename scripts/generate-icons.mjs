import { createWriteStream } from "fs"
import { deflateSync } from "zlib"

function createPNG(size, bgColor, fgColor) {
  const width = size
  const height = size

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  const [br, bg, bb] = hexToRgb(bgColor)
  const [fr, fg, fb] = hexToRgb(fgColor)

  // Build raw image data (RGBA)
  const rawData = []
  const cx = width / 2
  const cy = height / 2
  const r = width * 0.3

  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte
    for (let x = 0; x < width; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Draw a circle "W" shape
      const inCircle = dist < r
      const isLetter = inCircle && (
        // Simple W shape approximation
        (Math.abs(dx / r * 0.8) > 0.55 && Math.abs(dy / r) < 0.5 && dy > -r * 0.5) ||
        (Math.abs(dx / r * 0.8) < 0.2 && dy > 0 && dy < r * 0.5)
      )
      if (isLetter) {
        rawData.push(fr, fg, fb, 255)
      } else if (inCircle) {
        rawData.push(br, bg, bb, 255)
      } else {
        rawData.push(br, bg, bb, 255)
      }
    }
  }

  const raw = Buffer.from(rawData)
  const compressed = deflateSync(raw)

  function crc32(buf) {
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    let crc = 0xffffffff
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, "ascii")
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const crcBuf = Buffer.concat([typeBytes, data])
    const crcVal = Buffer.alloc(4)
    crcVal.writeUInt32BE(crc32(crcBuf))
    return Buffer.concat([len, typeBytes, data, crcVal])
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

const icon192 = createPNG(192, "#7c3aed", "#ffffff")
const icon512 = createPNG(512, "#7c3aed", "#ffffff")
const apple = createPNG(180, "#7c3aed", "#ffffff")

import { writeFileSync } from "fs"
writeFileSync("public/icon-192.png", icon192)
writeFileSync("public/icon-512.png", icon512)
writeFileSync("public/apple-touch-icon.png", apple)

console.log("Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png")
