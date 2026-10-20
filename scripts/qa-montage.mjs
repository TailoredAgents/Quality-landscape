import sharp from "sharp";
const [name = "home", width = "375"] = process.argv.slice(2);
const file = `qa/screenshots/${name}-${width}.png`;
const meta = await sharp(file).metadata();
const slice = 1500;
const count = Math.ceil(meta.height / slice);
const inputs = await Promise.all(
  Array.from({ length: count }, async (_, i) => ({
    input: await sharp(file)
      .extract({
        left: 0,
        top: i * slice,
        width: meta.width,
        height: Math.min(slice, meta.height - i * slice),
      })
      .png()
      .toBuffer(),
    left: i * meta.width,
    top: 0,
  })),
);
await sharp({
  create: {
    width: meta.width * count,
    height: slice,
    channels: 3,
    background: "#f6f4ed",
  },
})
  .composite(inputs)
  .png()
  .toFile(`qa/${name}-${width}-montage.png`);
