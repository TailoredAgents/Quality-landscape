import sharp from "sharp";
import fs from "node:fs";
const files = fs.readdirSync("public/images").filter((f) => f.endsWith(".jpg"));
const inputs = await Promise.all(
  files.map(async (f, i) => ({
    input: await sharp("public/images/" + f)
      .resize(400, 260, { fit: "cover" })
      .extend({ bottom: 35, background: "#f6f4ed" })
      .composite([
        {
          input: Buffer.from(
            `<svg width="400" height="35"><text x="12" y="24" font-size="18">${f}</text></svg>`,
          ),
          top: 260,
          left: 0,
        },
      ])
      .toBuffer(),
    left: (i % 2) * 400,
    top: Math.floor(i / 2) * 295,
  })),
);
await sharp({
  create: {
    width: 800,
    height: Math.ceil(files.length / 2) * 295,
    channels: 3,
    background: "#f6f4ed",
  },
})
  .composite(inputs)
  .png()
  .toFile("qa/contact-sheet.png");
