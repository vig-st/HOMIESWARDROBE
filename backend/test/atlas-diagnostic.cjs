// Read-only Atlas diagnostics. Never logs the URI, credentials, or document data.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const dns = require('node:dns').promises;
const net = require('node:net');
const tls = require('node:tls');
const { createRequire } = require('node:module');
const { spawn } = require('node:child_process');

const backend = path.resolve(__dirname, '..');
const family = process.argv.includes('--ipv4') ? 4 : undefined;
const inherited = process.env.MONGO_URI;
const dotenv = require('dotenv');
const parsed = dotenv.parse(fs.readFileSync(path.join(backend, '.env')));
dotenv.config({ path: path.join(backend, '.env'), quiet: true });
const uri = process.env.MONGO_URI;
let endpoint;
try { endpoint = new URL(uri); } catch { /* Report invalid configuration safely. */ }
const secrets = [uri, endpoint?.username, endpoint?.password]
  .filter(Boolean).flatMap((value) => {
    try { return [value, decodeURIComponent(value)]; } catch { return [value]; }
  });
function redact(value) {
  let text = String(value || '');
  for (const secret of secrets) text = text.split(secret).join('[REDACTED]');
  return text.replace(/mongodb(?:\+srv)?:\/\/[^\s'"<>]+/gi, '[REDACTED_URI]');
}
function failure(error, depth = 0) {
  if (!error) return undefined;
  return {
    name: error.name,
    code: error.code,
    message: redact(error.message),
    cause: depth < 3 ? failure(error.cause, depth + 1) : undefined,
  };
}
function report(label, value) { console.log(label + ': ' + JSON.stringify(value)); }

async function runtime() {
  const mongoose = require('mongoose');
  const fromMongoose = createRequire(require.resolve('mongoose'));
  const mongoosePackage = require('mongoose/package.json');
  const driverPackage = fromMongoose('mongodb/package.json');
  const lock = JSON.parse(fs.readFileSync(path.join(backend, 'package-lock.json')));
  const manifest = JSON.parse(fs.readFileSync(path.join(backend, 'package.json')));
  const driverPath = path.relative(backend, fromMongoose.resolve('mongodb/package.json'))
    .replaceAll('\\', '/').replace('/package.json', '');
  report('Runtime', { node: process.version, openssl: process.versions.openssl,
    os: os.version(), release: os.release(), arch: os.arch(), mongoose: mongoose.version,
    mongodb: driverPackage.version, mongooseNodeRange: mongoosePackage.engines.node,
    mongodbNodeRange: driverPackage.engines.node, utc: new Date().toISOString() });
  report('Environment', { MONGO_URI_loaded: Boolean(uri), validURI: Boolean(endpoint),
    inheritedURI: Boolean(inherited), dotenvOverrodeExistingURI: Boolean(inherited && inherited !== uri),
    matchesEnvFile: uri === parsed.MONGO_URI,
    duplicateMongoAssignments: fs.readFileSync(path.join(backend, '.env'), 'utf8')
      .split(/\r?\n/).filter((line) => /^\s*MONGO_URI\s*=/.test(line)).length > 1,
    surroundingWhitespace: uri !== uri?.trim(), scheme: endpoint?.protocol,
    host: endpoint?.hostname });
  report('LockConsistency', {
    dependencies: JSON.stringify(manifest.dependencies) === JSON.stringify(lock.packages[''].dependencies),
    devDependencies: JSON.stringify(manifest.devDependencies) === JSON.stringify(lock.packages[''].devDependencies),
    mongoose: lock.packages['node_modules/mongoose']?.version === mongoosePackage.version,
    mongodb: lock.packages[driverPath]?.version === driverPackage.version,
  });
  report('ProxyAndTLSVariablesSet', Object.fromEntries([
    'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NODE_EXTRA_CA_CERTS', 'NODE_OPTIONS',
    'NODE_TLS_REJECT_UNAUTHORIZED', 'NODE_USE_ENV_PROXY',
  ].map((key) => [key, Boolean(process.env[key])])));
  report('TLSVerification', { disabledByEnvironment: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0',
    insecureURIOptions: ['tlsAllowInvalidCertificates', 'tlsAllowInvalidHostnames', 'tlsInsecure']
      .some((key) => endpoint?.searchParams.get(key) === 'true') });
}

function tcpProbe(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port, family });
    let done = false;
    const finish = (result) => { if (!done) { done = true; socket.destroy(); resolve(result); } };
    socket.setTimeout(10000, () => finish({ pass: false, code: 'TIMEOUT' }));
    socket.once('connect', () => finish({ pass: true, remoteFamily: socket.remoteFamily }));
    socket.once('error', (error) => finish({ pass: false, error: failure(error) }));
  });
}
function tlsProbe(host, port) {
  return new Promise((resolve) => {
    // Default certificate and hostname verification remain enabled.
    const socket = tls.connect({ host, port, servername: host, family });
    let done = false;
    const finish = (result) => { if (!done) { done = true; socket.destroy(); resolve(result); } };
    socket.setTimeout(10000, () => finish({ pass: false, code: 'TIMEOUT' }));
    socket.once('secureConnect', () => {
      const certificate = socket.getPeerCertificate();
      finish({ pass: socket.authorized, protocol: socket.getProtocol(), remoteFamily: socket.remoteFamily,
        certificateValidFrom: certificate.valid_from, certificateValidTo: certificate.valid_to });
    });
    socket.once('error', (error) => finish({ pass: false, error: failure(error) }));
  });
}
async function network() {
  if (!endpoint || endpoint.protocol !== 'mongodb+srv:') throw new Error('Expected a valid SRV connection configuration');
  const records = await dns.resolveSrv('_mongodb._tcp.' + endpoint.hostname);
  report('SRV', { pass: records.length > 0, records });
  for (const record of records) {
    let addresses;
    try { addresses = await dns.lookup(record.name, { all: true }); }
    catch (error) { report('HostDNS', { host: record.name, pass: false, error: failure(error) }); continue; }
    report('HostDNS', { host: record.name, pass: true, addressFamilies: addresses.map((entry) => entry.family) });
    report('TCP', { host: record.name, port: record.port, ...await tcpProbe(record.name, record.port) });
    report('TLS', { host: record.name, port: record.port, ...await tlsProbe(record.name, record.port) });
  }
  try {
    const start = Date.now();
    const response = await fetch('https://www.microsoft.com', { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    const serverDate = response.headers.get('date');
    report('HTTPSClockCheck', { localUTC: new Date().toISOString(), serverDate,
      absoluteDifferenceSeconds: serverDate ? Math.round(Math.abs(Date.parse(serverDate) - (start + Date.now()) / 2) / 1000) : null });
  } catch (error) { report('HTTPSClockCheck', { error: failure(error) }); }
}

async function connect(kind) {
  const mongoose = require('mongoose');
  const fromMongoose = createRequire(require.resolve('mongoose'));
  const { MongoClient } = fromMongoose('mongodb');
  const options = { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, maxPoolSize: 1,
    ...(family ? { family } : {}) };
  const client = kind === 'driver' ? new MongoClient(uri, options) : null;
  const started = Date.now();
  try {
    if (client) {
      await client.connect();
      await client.db().command({ ping: 1 });
    } else {
      await mongoose.connect(uri, options);
      await mongoose.connection.db.command({ ping: 1 });
    }
    report('Connection', { kind, pass: true, elapsedMs: Date.now() - started, node: process.version, family });
  } catch (error) {
    report('Connection', { kind, pass: false, elapsedMs: Date.now() - started, node: process.version, family,
      error: failure(error), servers: error.reason?.servers ? [...error.reason.servers.values()]
        .map((server) => ({ type: server.type, error: failure(server.error) })) : [] });
    process.exitCode = 1;
  } finally {
    if (client) await client.close();
    else await mongoose.disconnect();
  }
}

async function httpChecks() {
  const base = 'http://127.0.0.1:' + (process.env.PORT || 5000);
  for (const [route, count] of [['/api/health'], ['/api/products', 25],
    ['/api/products?gender=men', 14], ['/api/products?gender=women', 15]]) {
    const response = await fetch(base + route, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    report('HTTP', { route, status: response.status,
      ...(count === undefined ? { mongodb: body.mongodb, health: body.status }
        : { count: body.data?.length, expected: count }),
      pass: response.status === 200 && (count === undefined ? body.mongodb === 'connected' : body.data?.length === count) });
  }
}

async function compareRuntimes() {
  const records = await dns.resolveSrv('_mongodb._tcp.' + endpoint.hostname);
  const host = records[0].name;
  const [address] = await dns.resolve4(host);
  const probe = [
    "const tls = require('node:tls');",
    "const socket = tls.connect({ host: process.env.ATLAS_PROBE_ADDRESS, servername: process.env.ATLAS_PROBE_HOST, port: 27017 });",
    "function done(result) { console.log(JSON.stringify({node: process.version, openssl: process.versions.openssl, ...result})); socket.destroy(); }",
    "socket.setTimeout(10000, () => done({pass:false,code:'TIMEOUT'}));",
    "socket.once('secureConnect', () => done({pass:socket.authorized,protocol:socket.getProtocol()}));",
    "socket.once('error', error => done({pass:false,name:error.name,code:error.code,message:error.message}));",
  ].join('\n');
  for (const version of ['v20.20.2', 'v24.18.0']) {
    const executable = path.join(process.env.LOCALAPPDATA, 'nvm', version, 'node.exe');
    if (!fs.existsSync(executable)) continue;
    // Pin the previously resolved IPv4 address only for this TLS comparison.
    // SNI and hostname/certificate verification still use the real Atlas hostname.
    await new Promise((resolve, reject) => {
      const child = spawn(executable, ['-e', probe], {
        windowsHide: true,
        env: { ...process.env, ATLAS_PROBE_HOST: host, ATLAS_PROBE_ADDRESS: address },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stdout.on('data', (data) => process.stdout.write(redact(data)));
      child.stderr.on('data', (data) => process.stderr.write(redact(data)));
      child.once('error', reject);
      child.once('exit', resolve);
    });
  }
}

const mode = process.argv[2] || 'runtime';
const action = { runtime, network, mongoose: () => connect('mongoose'),
  driver: () => connect('driver'), http: httpChecks, 'compare-runtimes': compareRuntimes }[mode];
if (!action) throw new Error('Use runtime, network, mongoose, driver, http, or compare-runtimes');
action().catch((error) => { report('DiagnosticFailure', failure(error)); process.exitCode = 1; });
