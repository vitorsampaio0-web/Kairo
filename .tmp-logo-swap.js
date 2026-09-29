const fs = require('fs');
const crlf = s => s.replace(/\r?\n/g, '\r\n');

function edit(file, name, oldStr, newStr) {
  let src = fs.readFileSync(file, 'utf8');
  const o = crlf(oldStr), n = crlf(newStr);
  const count = src.split(o).length - 1;
  if (count !== 1) { console.error(`ERRO [${file}] ${name}: ${count} ocorrencias`); process.exit(1); }
  fs.writeFileSync(file, src.replace(o, n));
  console.log(`OK [${file}] ${name}`);
}

// 1. Logo do header (apenas a ocorrencia dentro do .nav-logo)
edit('index.html', 'logo header PT',
  `<a href="index.html" class="nav-logo" aria-label="Kairo — início">
        <img src="./logo-kairo.png" width="1254" height="1254" srcset="./logo-kairo.webp" alt="Kairo" loading="eager" onerror="this.style.display='none'" />`,
  `<a href="index.html" class="nav-logo" aria-label="Kairo — início">
        <img src="./logo-k-symbol.png" width="64" height="96" alt="Kairo" loading="eager" onerror="this.style.display='none'" />`);

edit('landing-en.html', 'logo header EN',
  `<a href="landing-en.html" class="nav-logo" aria-label="Kairo — home">
        <img src="./logo-kairo.png" width="1254" height="1254" srcset="./logo-kairo.webp" alt="Kairo" loading="eager" onerror="this.style.display='none'" />`,
  `<a href="landing-en.html" class="nav-logo" aria-label="Kairo — home">
        <img src="./logo-k-symbol.png" width="64" height="96" alt="Kairo" loading="eager" onerror="this.style.display='none'" />`);

// 2. Remover eyebrow do hero
edit('index.html', 'remover eyebrow PT',
  `          <div class="hero-eyebrow">
            <span class="eyebrow"><span class="eyebrow-dot"></span>Kairo — Sistema de produtividade com IA</span>
          </div>
`, '');
edit('landing-en.html', 'remover eyebrow EN',
  `          <div class="hero-eyebrow">
            <span class="eyebrow"><span class="eyebrow-dot"></span>Kairo — AI Productivity OS</span>
          </div>
`, '');

// 3. Bump cache
edit('sw.js', 'cache v8', 'const CACHE_NAME = "kairo-v7";', 'const CACHE_NAME = "kairo-v8";');

console.log('Concluido.');
