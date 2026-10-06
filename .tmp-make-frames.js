const sharp = require('sharp');
const fs = require('fs');

const BLOB = 'C:/Users/vitor/.verdent/storage/profiles/prod-s1/workspaces/exe-pro--proj_bb94bb7472439465/shared/blobs/sha256';
const OUT = 'C:/Users/vitor/projects/exe-pro/video-frames';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// fonte SVG com escapes
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function textSvg({ eyebrow, headline, sub, brand }) {
  return Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#050b16"/>
      <stop offset="0.55" stop-color="#081426"/>
      <stop offset="1" stop-color="#0a1a33"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#4ea8ff" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="#7c5cff" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <rect width="1080" height="1920" fill="url(#glow)"/>
  <circle cx="540" cy="250" r="300" fill="#4ea8ff" opacity="0.06"/>
  <text x="540" y="150" font-family="Arial, sans-serif" font-size="26" font-weight="bold" letter-spacing="6" fill="#4ea8ff" text-anchor="middle">${esc(eyebrow)}</text>
  <text x="540" y="235" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle">${esc(headline)}</text>
  <text x="540" y="305" font-family="Arial, sans-serif" font-size="34" fill="#b8c4d6" text-anchor="middle">${esc(sub)}</text>
  ${brand ? `
  <text x="540" y="560" font-family="Arial, sans-serif" font-size="120" font-weight="bold" letter-spacing="18" fill="#ffffff" text-anchor="middle">KAIRO</text>
  <text x="540" y="625" font-family="Arial, sans-serif" font-size="30" letter-spacing="10" fill="#4ea8ff" text-anchor="middle">ELITE PRODUCTIVITY</text>
  ` : ''}
  <text x="540" y="1860" font-family="Arial, sans-serif" font-size="26" letter-spacing="4" fill="#4ea8ff" text-anchor="middle" opacity="0.85">kairoelite.app</text>
</svg>`);
}

const frames = [
  {
    file: `${BLOB}/da/8a/da8aa7c7eecd7a935ea5b5bac02f99ff047e00e5edb4ac6f49da54c8bc313e6a`,
    out: '01-hero.png', brand: true,
    eyebrow: 'AI PRODUCTIVITY OS',
    headline: "Own your time. Own your life.",
    sub: 'One system. Tasks, habits, goals and performance.',
  },
  {
    file: `${BLOB}/fb/15/fb157b8904787d7d009630059debcc4a7967882d58c1dbfa986387c5114726dd`,
    out: '02-tasks.png',
    eyebrow: 'KAIRO ELITE PRODUCTIVITY',
    headline: 'SMART TASK CREATION',
    sub: 'Set priority, deadline and context in seconds.',
  },
  {
    file: `${BLOB}/47/b4/47b438657f36aac03111ec3c8f54d43f3a652bdf1508e2ed4814a10584db7bbd`,
    out: '03-habits.png',
    eyebrow: 'KAIRO ELITE PRODUCTIVITY',
    headline: 'HABITS THAT COMPOUND',
    sub: 'Streaks, weekly progress and Kairo AI recommendations.',
  },
  {
    file: `${BLOB}/4b/92/4b924adc26af68bd6764800670305ca0302699a48910c1efaf258b4a12a30e20`,
    out: '04-history.png',
    eyebrow: 'KAIRO ELITE PRODUCTIVITY',
    headline: 'HISTORY',
    sub: 'Review what was done. Improve what comes next.',
  },
];

(async () => {
  for (const f of frames) {
    const frameH = 880; // largura do ecrã original 1920 -> escala 1080/1920 => altura 1215? mantemos mais pequeno p/ textos
    const img = await sharp(f.file).resize({ width: 980 }).toBuffer();
    const meta = await sharp(img).metadata();
    const top = Math.round((1920 - meta.height) / 2) + 60; // ligeiro desvio para baixo p/ texto em cima
    await sharp(textSvg(f))
      .composite([{ input: img, top: Math.max(360, top), left: Math.round((1080 - meta.width) / 2) }])
      .png()
      .toFile(`${OUT}/${f.out}`);
    console.log(`OK ${f.out} (${meta.width}x${meta.height} @top ${Math.max(360, top)})`);
  }
})();
