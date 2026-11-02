// --- make_cert.js ---
// Creates the self-signed key and certificate the HTTPS server needs, when
// they are missing. They are kept out of git, so a fresh clone has none and
// the server used to die at start-up; openssl, the README's recipe, is not
// at hand on Windows. Run by `npm install` (via setup.js) or `npm run cert`.
// A complete pair is never overwritten.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const selfsigned = require('selfsigned');

const root = path.join(__dirname, '..');

// Same paths as html_app.js: config.yaml if it says so, else the defaults.
let keyPath = 'key.pem';
let certPath = 'server.crt';
try {
    const conf = yaml.load(fs.readFileSync(path.join(root, 'static', 'config.yaml'), 'utf8'));
    const ssl = conf && conf.server && conf.server.ssl;
    if (ssl && ssl.key) keyPath = ssl.key;
    if (ssl && ssl.cert) certPath = ssl.cert;
} catch (e) { /* no config.yaml yet: keep the defaults */ }
keyPath = path.resolve(root, keyPath);
certPath = path.resolve(root, certPath);

async function main() {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        console.log('[make_cert] Certificate already present, nothing to do.');
        return;
    }
    const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
        keySize: 2048,
        // Ten years: a self-signed local certificate gains nothing by expiring.
        notAfterDate: new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000),
        extensions: [{
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' },
                { type: 7, ip: '::1' }
            ]
        }]
    });
    fs.writeFileSync(keyPath, pems.private, { mode: 0o600 });
    fs.writeFileSync(certPath, pems.cert);
    console.log('[make_cert] Self-signed certificate written:\n  ' + keyPath + '\n  ' + certPath);
}

main().catch(function (err) {
    console.error('[make_cert] Could not create the certificate:', err.message);
    process.exit(1);
});
