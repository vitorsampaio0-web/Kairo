const sharp = require('sharp');

async function run() {
  const { data, info } = await sharp('.tmp-k-crop.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Fundo navy muito escuro -> transparente, com transicao suave
    if (r < 22 && g < 34 && b < 62) {
      px[i + 3] = 0;
    } else if (lum < 34) {
      px[i + 3] = Math.round(255 * (lum / 34));
    }
  }

  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile('logo-k-symbol.png');

  const meta = await sharp('logo-k-symbol.png').metadata();
  console.log('logo-k-symbol.png:', meta.width + 'x' + meta.height);
}

run().catch(e => { console.error(e); process.exit(1); });
