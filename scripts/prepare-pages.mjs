// Post-export step for GitHub Pages:
//  - injects the desktop phone-frame styles into dist/index.html
//  - copies index.html to 404.html so deep links / refreshes work
//  - adds .nojekyll so Pages serves the "_expo" folder
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const html = 'dist/index.html';
const css = readFileSync('web/frame.css', 'utf8');
let page = readFileSync(html, 'utf8');
page = page.replace('</head>', `<style id="roomorph-frame">\n${css}</style>\n</head>`);
page = page.replace('<div id="root"></div>', '<div id="root"><div id="boot">Loading Roomorph…</div></div>');
writeFileSync(html, page);
copyFileSync(html, 'dist/404.html');
writeFileSync('dist/.nojekyll', '');
console.log('Pages build ready in dist/');
