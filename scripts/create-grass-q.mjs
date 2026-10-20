import fs from "node:fs/promises";

// Original vector artwork: a quiet circular Q with individually tapered grass blades.
const point = (angle, radius) => [
  30 + Math.cos(angle) * radius,
  29 + Math.sin(angle) * radius,
];
const xy = (p) => p.map((v) => v.toFixed(2)).join(" ");
const blades = Array.from({ length: 27 }, (_, index) => {
  const angle = Math.PI * (1.01 + index / 27);
  const base = point(angle, 19);
  const length = [6, 4, 7.5, 5, 3.5, 6.5, 4.5][index % 7];
  const tip = [base[0] + (index % 3 === 0 ? -2 : 3), base[1] - length];
  return `M${xy([base[0] - 1.8, base[1] + 2])}Q${xy([base[0] - 1.8, base[1] - length / 2])} ${xy(tip)}Q${xy([base[0] + 0.8, base[1] - length / 2])} ${xy([base[0] + 1.8, base[1] + 2])}Z`;
}).join("");
const ring =
  "M51 29a21 21 0 1 1-42 0 21 21 0 0 1 42 0ZM42 29a12 12 0 1 0-24 0 12 12 0 0 0 24 0Z";
const tail = "M33 36c10 2 15 9 24 17-10-1-19-6-24-17Z";
const highlight = "M36 39c7 3 12 8 18 12-8-3-14-7-18-12Z";
const grass =
  "M15 27C13 20 15 12 18 8c-1 7-1 12-1 17ZM20 22c-1-7 1-14 4-19-1 7-1 12-1 17ZM28 18c-1-5 0-10 2-14-1 6 0 9 0 13ZM35 19c1-6 3-11 7-15-2 6-3 10-4 14ZM42 23c2-6 5-10 9-13-3 5-4 9-6 14Z";
const shapes = `<path fill="currentColor" fill-rule="evenodd" d="${ring}"/><path fill="currentColor" d="${blades}${tail}"/><path fill="#9DB77F" d="${grass}${highlight}"/>`;

await fs.writeFile(
  "public/brand/grass-q.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" color="#193D32">${shapes}</svg>\n`,
);
await fs.writeFile(
  "src/components/grass-q.tsx",
  `// Original vector mark. Editable source: scripts/create-grass-q.mjs\nexport function GrassQMark({ className = "" }: { className?: string }) {\n  return <svg className={className} width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">\n    <path fill="currentColor" fillRule="evenodd" d="${ring}" />\n    <path fill="currentColor" d="${blades}${tail}" />\n    <path fill="#9DB77F" d="${grass}${highlight}" />\n  </svg>;\n}\n`,
);
await fs.writeFile(
  "src/app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#193D32"/><g transform="translate(5 5) scale(.84)" color="#D4DEC6">${shapes}</g></svg>\n`,
);
