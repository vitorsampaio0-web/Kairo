const fs = require("fs");
let p = fs.readFileSync("hero-proto.html", "utf8");

// 1. Fundo do hero: prédios como background da página (sem caixa)
const oldBg = `.hero-bg {
      background:
        radial-gradient(120% 55% at 50% 0%, rgba(22,139,255,0.16) 0%, transparent 55%),
        radial-gradient(80% 45% at 85% 92%, rgba(45,107,255,0.12) 0%, transparent 60%),
        linear-gradient(180deg, #04101F 0%, #020817 55%, #020817 100%);
    }`;
const newBg = `.hero-bg {
      background:
        linear-gradient(180deg, rgba(2,8,23,0.72) 0%, rgba(2,8,23,0.45) 30%, rgba(2,8,23,0.55) 60%, rgba(2,8,23,0.95) 100%),
        url('./hero-proto-towers.jpg') center 30% / cover no-repeat,
        linear-gradient(180deg, #04101F 0%, #020817 100%);
    }`;
if (!p.includes(oldBg)) { console.error("bg CSS nao encontrado"); process.exit(1); }
p = p.replace(oldBg, newBg);

// 2. iPhone: trocar imagem JPEG pela versao transparente (mobile e desktop)
p = p.split("./hero-proto-bg.jpg").join("./hero-proto-phone.png");

fs.writeFileSync("hero-proto.html", p);
console.log("proto montado: torres no fundo + iphone transparente");
