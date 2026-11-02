// --- setup.js ---
// First-run setup, run by `npm install` (postinstall): what git leaves out
// on purpose, a fresh clone needs to start. Copies each static/*.example
// template whose real file is missing, then creates the SSL certificate.
// Files already there are left alone.

const fs = require('fs');
const path = require('path');

const staticDir = path.join(__dirname, '..', 'static');

fs.readdirSync(staticDir)
    .filter(function (name) { return name.endsWith('.example'); })
    .forEach(function (name) {
        const target = path.join(staticDir, name.replace(/\.example$/, ''));
        if (fs.existsSync(target)) return;
        fs.copyFileSync(path.join(staticDir, name), target);
        console.log('[setup] Created ' + path.relative(process.cwd(), target) + ' from its template.');
    });

// After the copy: make_cert reads the certificate paths from config.yaml.
require('./make_cert');
