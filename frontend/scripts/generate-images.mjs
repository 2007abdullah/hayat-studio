// Generates consistent, lightweight SVG artwork for services and projects (no external image hosts, no broken URLs).
// Run: npm run gen:images   (artwork is committed, so you only re-run this if you change it)
import { mkdirSync, writeFileSync } from "node:fs";

const palette = ["#62d0ff", "#7c8cff", "#ffb86b", "#5eead4"];
const frame = (id, title, motif, hue = 0) => {
  const a = palette[hue % 4], b = palette[(hue + 1) % 4];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" role="img" aria-label="${title}">
<defs>
<linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1119"/><stop offset="1" stop-color="#101a28"/></linearGradient>
<linearGradient id="ac${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="gl${id}" cx=".7" cy=".25" r=".6"><stop offset="0" stop-color="${a}" stop-opacity=".28"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
<pattern id="gr${id}" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#1c2838" stroke-width="1"/></pattern>
</defs>
<rect width="1200" height="750" fill="url(#bg${id})"/><rect width="1200" height="750" fill="url(#gr${id})" opacity=".7"/><rect width="1200" height="750" fill="url(#gl${id})"/>
${motif(`url(#ac${id})`, a, b)}
</svg>`;
};
const win = (x, y, w, h, fill = "#0f1722") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}" stroke="#25344a"/><circle cx="${x + 24}" cy="${y + 24}" r="5" fill="#ff7a7a"/><circle cx="${x + 44}" cy="${y + 24}" r="5" fill="#ffd36e"/><circle cx="${x + 64}" cy="${y + 24}" r="5" fill="#6ee79a"/>`;
const lines = (x, y, rows, ac) => rows.map((r, i) => `<rect x="${x + r[0]}" y="${y + i * 30}" width="${r[1]}" height="10" rx="5" fill="${r[2] ? ac : "#2a3b52"}" opacity="${r[2] ? 0.9 : 1}"/>`).join("");
const bars = (x, y, vals, ac) => vals.map((v, i) => `<rect x="${x + i * 46}" y="${y - v}" width="28" height="${v}" rx="7" fill="${ac}" opacity="${0.45 + i * 0.07}"/>`).join("");
const node = (x, y, r, ac) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#0f1722" stroke="${ac}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r / 3}" fill="${ac}"/>`;

const M = {
  code: (ac) => win(250, 150, 700, 450) + lines(300, 230, [[0, 160, 1], [30, 300], [30, 220], [60, 260, 1], [60, 180], [30, 240], [0, 110, 1], [0, 340], [30, 200]], ac),
  site: (ac) => win(200, 130, 800, 490) + `<rect x="240" y="190" width="720" height="150" rx="12" fill="${ac}" opacity=".16"/><rect x="270" y="225" width="300" height="18" rx="9" fill="${ac}"/><rect x="270" y="260" width="420" height="10" rx="5" fill="#34475f"/><rect x="270" y="288" width="120" height="30" rx="15" fill="${ac}"/>` + [0, 1, 2].map((i) => `<rect x="${240 + i * 245}" y="370" width="230" height="200" rx="12" fill="#142031" stroke="#25344a"/>`).join(""),
  shop: (ac) => win(180, 130, 840, 490) + [0, 1, 2, 3].map((i) => `<rect x="${220 + i * 195}" y="190" width="170" height="210" rx="12" fill="#142031" stroke="#25344a"/><rect x="${236 + i * 195}" y="206" width="138" height="110" rx="8" fill="${ac}" opacity="${0.18 + i * 0.1}"/><rect x="${236 + i * 195}" y="332" width="90" height="10" rx="5" fill="#34475f"/><rect x="${236 + i * 195}" y="356" width="60" height="14" rx="7" fill="${ac}"/>`).join("") + `<rect x="220" y="430" width="760" height="150" rx="12" fill="#101a28" stroke="#25344a"/>`,
  saas: (ac) => win(150, 120, 900, 510) + `<rect x="180" y="170" width="170" height="430" rx="10" fill="#101a28"/>` + [0, 1, 2, 3, 4].map((i) => `<rect x="200" y="${200 + i * 44}" width="${i === 1 ? 130 : 100}" height="14" rx="7" fill="${i === 1 ? ac : "#2a3b52"}"/>`).join("") + bars(400, 520, [90, 150, 120, 210, 170, 250, 220, 300, 260, 340], ac) + `<polyline points="400,300 470,270 540,285 610,240 680,255 750,200 820,215 900,170" fill="none" stroke="${ac}" stroke-width="4" stroke-linecap="round"/>`,
  cloud: (ac) => `<path d="M360 470c-70 0-110-40-110-90 0-52 44-90 100-86 20-60 78-96 140-84 50 10 84 44 94 84 62-6 114 30 114 88 0 52-44 88-100 88z" fill="#0f1722" stroke="${ac}" stroke-width="3"/>` + [0, 1, 2].map((i) => `<rect x="${430 + i * 120}" y="520" width="90" height="70" rx="12" fill="#142031" stroke="#25344a"/><rect x="${446 + i * 120}" y="540" width="58" height="8" rx="4" fill="${ac}"/><rect x="${446 + i * 120}" y="560" width="40" height="8" rx="4" fill="#34475f"/>`).join("") + `<path d="M475 470v50M595 470v50M715 470v50" stroke="${ac}" stroke-width="2" stroke-dasharray="6 6"/>`,
  ai: (ac) => [[300, 250], [300, 400], [300, 550], [600, 200], [600, 330], [600, 460], [600, 590], [900, 320], [900, 480]].map(([x, y]) => node(x, y, 26, ac)).join("") + [[300, 250], [300, 400], [300, 550]].map(([x, y]) => [200, 330, 460, 590].map((y2) => `<line x1="${x}" y1="${y}" x2="600" y2="${y2}" stroke="#2a3b52" stroke-width="1.5"/>`).join("")).join("") + [200, 330, 460, 590].map((y) => [320, 480].map((y2) => `<line x1="600" y1="${y}" x2="900" y2="${y2}" stroke="${ac}" stroke-width="1.5" opacity=".6"/>`).join("")).join(""),
  api: (ac) => win(200, 150, 800, 450, "#0c141e") + `<text x="240" y="240" font-family="monospace" font-size="26" fill="${ac}">POST /api/orders</text><text x="240" y="290" font-family="monospace" font-size="22" fill="#8fa3ba">{ "status": "New",</text><text x="240" y="325" font-family="monospace" font-size="22" fill="#8fa3ba">  "order_number": "ORD-0001" }</text><rect x="240" y="380" width="160" height="42" rx="21" fill="${ac}" opacity=".9"/><text x="272" y="408" font-family="monospace" font-size="20" fill="#06101a">201 Created</text>` + lines(240, 470, [[0, 380], [0, 300], [0, 340]], ac),
  server: (ac) => [0, 1, 2].map((i) => `<rect x="320" y="${170 + i * 150}" width="560" height="120" rx="16" fill="#0f1722" stroke="#25344a"/><circle cx="364" cy="${230 + i * 150}" r="9" fill="${ac}"/><rect x="400" y="${215 + i * 150}" width="260" height="10" rx="5" fill="#34475f"/><rect x="400" y="${240 + i * 150}" width="180" height="10" rx="5" fill="#25344a"/><rect x="760" y="${212 + i * 150}" width="80" height="26" rx="13" fill="${ac}" opacity=".25"/>`).join(""),
  house: (ac) => `<path d="M300 420 600 190l300 230v200H300z" fill="#0f1722" stroke="${ac}" stroke-width="3"/><rect x="540" y="470" width="120" height="150" rx="8" fill="${ac}" opacity=".25"/>` + [0, 1].map((i) => `<rect x="${360 + i * 360}" y="450" width="100" height="90" rx="8" fill="#142031" stroke="#25344a"/>`).join(""),
  food: (ac) => `<circle cx="600" cy="375" r="190" fill="#0f1722" stroke="${ac}" stroke-width="3"/><circle cx="600" cy="375" r="130" fill="none" stroke="#25344a" stroke-width="2"/><circle cx="600" cy="375" r="70" fill="${ac}" opacity=".22"/><rect x="330" y="340" width="12" height="70" rx="6" fill="#8fa3ba"/><rect x="858" y="340" width="12" height="70" rx="6" fill="#8fa3ba"/>`,
  flow: (ac) => [0, 1, 2, 3].map((i) => `<rect x="${170 + i * 245}" y="320" width="200" height="110" rx="16" fill="#0f1722" stroke="${i % 2 ? "#25344a" : ac}" stroke-width="2"/><rect x="${200 + i * 245}" y="355" width="110" height="10" rx="5" fill="${ac}"/><rect x="${200 + i * 245}" y="382" width="80" height="10" rx="5" fill="#34475f"/>` + (i < 3 ? `<path d="M${375 + i * 245} 375h35" stroke="${ac}" stroke-width="3" stroke-dasharray="6 6"/>` : "")).join(""),
  board: (ac) => win(180, 130, 840, 490) + [0, 1, 2].map((c) => `<rect x="${215 + c * 270}" y="190" width="240" height="390" rx="12" fill="#101a28"/>` + [0, 1, 2].slice(0, 3 - (c === 2 ? 1 : 0)).map((r) => `<rect x="${230 + c * 270}" y="${215 + r * 110}" width="210" height="90" rx="10" fill="#142031" stroke="${c === 1 && r === 0 ? ac : "#25344a"}"/><rect x="${248 + c * 270}" y="${236 + r * 110}" width="120" height="10" rx="5" fill="#34475f"/><rect x="${248 + c * 270}" y="${262 + r * 110}" width="60" height="10" rx="5" fill="${ac}"/>`).join("")).join(""),
  career: (ac) => `<circle cx="600" cy="375" r="170" fill="none" stroke="#25344a" stroke-width="2"/><circle cx="600" cy="375" r="110" fill="none" stroke="#25344a" stroke-width="2"/><polygon points="600,235 722,330 690,470 510,470 478,330" fill="${ac}" opacity=".28" stroke="${ac}" stroke-width="3"/>` + node(600, 235, 12, ac) + node(722, 330, 12, ac) + node(690, 470, 12, ac) + node(510, 470, 12, ac) + node(478, 330, 12, ac),
};

const services = { "full-stack-web-development": "code", "business-website-development": "site", "e-commerce-development": "shop", "saas-application-development": "saas", "devops-cloud-deployment": "cloud", "ai-integration": "ai", "api-backend-development": "api", "deployment-maintenance": "server" };
const projects = { devtrack: "board", "ai-career-assistant": "career", "ecommerce-platform": "shop", "real-estate-platform": "house", "restaurant-ordering-platform": "food", "ai-lead-qualification": "flow" };
mkdirSync("public/img/services", { recursive: true });
mkdirSync("public/img/projects", { recursive: true });
let n = 0;
for (const [slug, m] of Object.entries(services)) writeFileSync(`public/img/services/${slug}.svg`, frame(n, slug.replace(/-/g, " "), M[m], n++));
for (const [slug, m] of Object.entries(projects)) writeFileSync(`public/img/projects/${slug}.svg`, frame(n, slug.replace(/-/g, " "), M[m], n++));
writeFileSync("public/img/portrait.svg", frame(99, "Abdullah Hayat portrait placeholder", (ac) => `<circle cx="600" cy="300" r="95" fill="${ac}" opacity=".85"/><path d="M380 640c0-130 100-210 220-210s220 80 220 210z" fill="${ac}" opacity=".5"/>`, 0));
console.log("generated", n + 1, "images");
