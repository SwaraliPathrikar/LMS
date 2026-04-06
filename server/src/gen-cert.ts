import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

const certDir = path.resolve('certs');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ Certs already exist at', certDir); process.exit(0);
}

console.log('Generating self-signed certificate...');
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'organizationName', value: 'LMS Dev' },
];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }] },
]);
cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync(keyPath, forge.pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync(certPath, forge.pki.certificateToPem(cert));
console.log('✅ Certs generated at', certDir);
