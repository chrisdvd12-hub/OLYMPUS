const fs = require("node:fs");
const path = require("node:path");

const file = path.join(process.cwd(), "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

const head = `
    <meta name="theme-color" content="#0B1426" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="OLYMPUS" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/olympus-icon.jpg" />
    <style>
      html, body, #root { background: #0B1426; }
      body { overscroll-behavior-y: none; }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    </style>`;

html = html.replace('<html lang="en">', '<html lang="fr">');
html = html.replace("</head>", `${head}\n  </head>`);
fs.writeFileSync(file, html);
