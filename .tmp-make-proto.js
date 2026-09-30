const fs = require("fs");
let s = fs.readFileSync("index.html", "utf8");

// 1. Remover redirect de idioma (o prototipo e sempre PT)
s = s.replace(/<script>\s*\/\/ Ingles e o idioma por defeito[\s\S]*?<\/script>\s*/, "");

// 2. Imagem do prototipo
s = s.split("hero-mobile-pt-v15.jpg").join("hero-proto-bg.jpg");

// 3. Remover moldura do iPhone (quadro a volta)
const oldCss = ".hero-mobile-visual img { width: 100%; height: auto; display: block; border-radius: 26px; border: 1px solid rgba(120,170,255,0.14); box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(22,139,255,0.10); }";
const newCss = ".hero-mobile-visual img { width: 100%; height: auto; display: block; }";
if (!s.includes(oldCss)) { console.error("CSS da moldura nao encontrado!"); process.exit(1); }
s = s.replace(oldCss, newCss);

// 4. Titulo do prototipo
s = s.replace("<title>Kairo — Produtividade de um CEO</title>", "<title>Kairo — Protótipo Hero (Prédios)</title>");

fs.writeFileSync("hero-proto.html", s);
console.log("hero-proto.html criado");
