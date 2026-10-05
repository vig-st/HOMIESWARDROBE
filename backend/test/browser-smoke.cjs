// Read-only smoke checks of the built frontend using installed Chrome/Edge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const root = path.resolve(__dirname, '../..');
const dist = path.join(root, 'customer/dist');
let apiServer, frontendServer, browser, socket, profile;
let apiBase = '';
const runtimeErrors = [];

async function main() {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(root, 'backend/.env'), quiet: true });
  const envPath = path.join(root, 'customer/.env');
  const compiledBase = (fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)).VITE_API_URL : '') || 'http://localhost:5000';
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
  frontendServer = http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let file = path.resolve(dist, '.' + pathname);
      if (!file.startsWith(dist + path.sep) && file !== dist) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
      let body = fs.readFileSync(file);
      // Adapt only the API origin to the ephemeral test server; never edit the build.
      if (path.extname(file) === '.js') body = Buffer.from(body.toString().split(compiledBase).join(apiBase));
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(500).end(); }
  });
  await new Promise((resolve) => frontendServer.listen(0, '127.0.0.1', resolve));
  const frontendBase = 'http://127.0.0.1:' + frontendServer.address().port;
  process.env.CUSTOMER_ORIGIN = frontendBase;
  process.env.PORT = '0';
  if (process.env.BROWSER_FIXTURE_MODE === '1') {
    console.log('Browser mode: explicit UI fixtures; live database is not exercised.');
    const products = [{
      _id: '000000000000000000000001', id: '000000000000000000000001',
      name: 'Browser Test Shirt', category: 'T-Shirts', description: 'UI regression fixture',
      price: 100, discountPrice: 10, stock: 8, gender: 'unisex',
      images: ['/uploads/products/browser-fixture-missing.jpg'], sizes: ['M'], colors: ['Black'],
      rating: 0, numReviews: 0,
    }];
    apiServer = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      res.setHeader('Access-Control-Allow-Origin', frontendBase);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
      let data;
      if (url.pathname === '/api/settings') {
        data = { shippingFee: 50, freeShippingMinimum: 999, taxRate: 18 };
      } else if (url.pathname === '/api/products') {
        data = products;
      } else if (url.pathname.endsWith('/reviews')) {
        data = [];
      } else if (url.pathname === '/api/products/' + products[0]._id) {
        data = products[0];
      } else {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data }));
    });
    await new Promise((resolve) => apiServer.listen(0, '127.0.0.1', resolve));
  } else {
    apiServer = await require('../server').startServer();
  }
  apiBase = 'http://127.0.0.1:' + apiServer.address().port;
  const catalog = await (await fetch(apiBase + '/api/products')).json();
  const product = catalog.data.find((p) => p.stock > 0 && p.images?.[0]?.startsWith('/uploads/'));
  assert.ok(product, 'catalog has an in-stock product for fallback testing');
  if (process.env.BROWSER_FIXTURE_MODE !== '1') {
    for (const item of catalog.data) {
      assert.ok(item.images?.length, item.name + ' has photography');
      for (const image of item.images) {
        const response = await fetch(new URL(image, apiBase));
        assert.ok(response.ok && response.headers.get('content-type')?.startsWith('image/'), item.name + ' gallery image loads');
        await response.arrayBuffer();
      }
    }
    console.log('PASS catalog: every product has accessible gallery images');
  }
  let failGallery = false;
  const settings = (await (await fetch(apiBase + '/api/settings')).json()).data;
  const executable = process.env.BROWSER_BINARY || [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((candidate) => fs.existsSync(candidate));
  assert.ok(executable, 'Chrome or Edge is installed');
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'homies-readiness-'));
  browser = spawn(executable, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 120 && !fs.existsSync(portFile); i++) await delay(250);
  assert.ok(fs.existsSync(portFile), 'headless browser started');
  const debugPort = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const targets = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
  const page = targets.find((target) => target.type === 'page');
  assert.ok(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 20000);
      pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); },
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (callback) {
        if (message.error) callback.reject(new Error(message.error.message));
        else callback.resolve(message.result);
      }
    } else if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params.exceptionDetails.text);
    } else if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      // Reuse the existing placeholder for remote photos, avoiding third-party
      // image-host availability in this test. Deliberately fail the selected
      // product's gallery so this check also works with a complete photo catalog.
      const action = failGallery && product.images.some((image) => request.url === apiBase + image)
        ? send('Fetch.fulfillRequest', { requestId, responseCode: 404, body: '' })
        : request.url.startsWith('https://images.unsplash.com/')
        ? send('Fetch.fulfillRequest', {
          requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
          body: fs.readFileSync(path.join(dist, 'placeholder.svg')).toString('base64'),
        })
        : send('Fetch.continueRequest', { requestId });
      action.catch(() => {});
    }
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ resourceType: 'Image', requestStage: 'Request' }] });
  const evaluate = async (expression) => {
    const value = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (value.exceptionDetails) throw new Error('Browser evaluation failed');
    return value.result.value;
  };
  const waitFor = async (expression, label) => {
    for (let i = 0; i < 120; i++) {
      if (await evaluate(expression)) return;
      await delay(250);
    }
    throw new Error('Timed out: ' + label);
  };
  const navigate = async (route) => {
    await send('Page.navigate', { url: frontendBase + route });
    await waitFor('document.readyState === "complete" && !!document.querySelector("h1")', 'page render ' + route);
  };
  const clickButton = (text) => evaluate('Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim() === ' + JSON.stringify(text) + ')?.click()');
  const cartCount = (quantity) => 'JSON.parse(localStorage.getItem("homiesCart") || "[]")[0]?.quantity === ' + quantity;
  const pass = (name) => console.log('PASS browser: ' + name);
  const screenshot = async (name) => {
    if (!process.env.BROWSER_SCREENSHOT_DIR) return;
    fs.mkdirSync(process.env.BROWSER_SCREENSHOT_DIR, { recursive: true });
    await delay(700);
    const capture = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(process.env.BROWSER_SCREENSHOT_DIR, name + '.png'), Buffer.from(capture.data, 'base64'));
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate('/shop');
  await waitFor('document.querySelectorAll(\'a[href^="/product/"]\').length > 0', 'mobile catalog');
  await waitFor('Array.from(document.querySelectorAll("main img")).every(i => i.complete && i.naturalWidth > 0)', 'catalog photos rendered');
  await screenshot('shop-mobile');
  assert.ok(await evaluate('document.body.textContent.includes("₹") && !document.querySelector("main").textContent.includes("$")'));
  assert.ok(await evaluate('Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim() === "Filters")?.getBoundingClientRect().width > 0'));
  await clickButton('Filters');
  await waitFor('document.querySelector("dialog").open', 'mobile filters open');
  await screenshot('filters-mobile');
  await evaluate('Array.from(document.querySelector("dialog").querySelectorAll("button")).find(b => b.textContent.trim() === ' + JSON.stringify(product.category) + ')?.click()');
  await evaluate('document.querySelector(\'button[aria-label="Close filters"]\').click()');
  await waitFor('!document.querySelector("dialog").open && document.body.style.overflow !== "hidden"', 'mobile filters close');
  assert.ok(await evaluate('document.querySelector("section").textContent.includes(' + JSON.stringify(product.name) + ')'));
  await clickButton('Filters');
  await waitFor('document.querySelector("dialog").open', 'reopen mobile filters');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await waitFor('!document.querySelector("dialog").open', 'escape closes filters');
  assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'));
  pass('mobile filters open, apply, close and support Escape; prices use INR');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('/');
  await waitFor('Array.from(document.images).some(i => i.src.endsWith("/images/editorial.jpg") && i.complete && i.naturalWidth > 0)', 'local editorial photo');
  pass('local editorial photo loads');
  await navigate('/shop');
  await waitFor('document.querySelectorAll(\'a[href^="/product/"]\').length > 0 && Array.from(document.querySelectorAll("main img")).every(i => i.complete && i.naturalWidth > 0)', 'desktop catalog photos');
  await screenshot('shop-desktop');

  await navigate('/forgot-password');
  assert.ok(await evaluate('document.body.textContent.includes("Password recovery is not available in this demo.")'));
  assert.ok(!(await evaluate('document.body.textContent.includes("link has been sent")')));
  await navigate('/reset-password');
  assert.ok(await evaluate('document.body.textContent.includes("Password recovery is not available in this demo.")'));
  assert.ok(!(await evaluate('document.body.textContent.includes("Password updated")')));
  pass('password recovery clearly unavailable');

  await navigate('/contact');
  assert.ok(await evaluate('document.body.textContent.includes("saved only in this browser")'));
  await evaluate([
    '(() => {',
    'const values = ["Demo Test", "demo@example.invalid", "Demo subject"];',
    'const form = Array.from(document.querySelectorAll("form")).find(f => f.querySelector("textarea"));',
    '[...form.querySelectorAll("input")].forEach((input, index) => {',
    'Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, values[index]);',
    'input.dispatchEvent(new Event("input", { bubbles: true }));',
    '});',
    'const textarea = form.querySelector("textarea");',
    'Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(textarea, "This is a browser-only demo contact test.");',
    'textarea.dispatchEvent(new Event("input", { bubbles: true }));',
    '})()',
  ].join('\n'));
  await clickButton('Save Demo Message');
  await waitFor('document.body.textContent.includes("No message was sent to HOMIESWARDROBE.")', 'contact demo confirmation');
  pass('contact stores locally and explicitly says not sent');

  failGallery = true;
  await navigate('/product/' + product._id);
  await waitFor('document.body.textContent.includes(' + JSON.stringify(product.name) + ')', 'product fetched');
  await waitFor('Array.from(document.images).some(i => i.alt === ' + JSON.stringify(product.name) +
    ' && i.src.endsWith("/placeholder.svg") && i.complete && i.naturalWidth > 0)', 'missing gallery falls back');
  pass('missing product gallery fallback renders');

  await clickButton('Add to Cart');
  await waitFor(cartCount(1), 'add to cart');
  await navigate('/cart');
  await clickButton('+');
  await waitFor(cartCount(2), 'quantity increase');
  await clickButton('-');
  await waitFor(cartCount(1), 'quantity decrease');
  await navigate('/cart');
  await waitFor(cartCount(1), 'cart reload persistence');
  const subtotal = product.price - (product.discountPrice || 0);
  const shipping = subtotal >= settings.freeShippingMinimum ? 0 : settings.shippingFee;
  const tax = Number((subtotal * settings.taxRate / 100).toFixed(2));
  const total = (subtotal + shipping + tax).toFixed(2);
  await waitFor('document.querySelector("aside")?.textContent.includes(' + JSON.stringify(String.fromCharCode(0x20b9) + total) + ')', 'cart totals');
  pass('cart add, increase, decrease, persistence and store pricing');

  await navigate('/shop');
  await waitFor('document.querySelectorAll(\'a[href^="/product/"]\').length > 0', 'shop loaded');
  await evaluate('Array.from(document.querySelectorAll(\'a[href="/men"]\')).find(a => a.textContent.trim().toLowerCase() === "men")?.click()');
  await waitFor('location.pathname === "/men" && document.querySelector("h1")?.textContent.toLowerCase().includes("men")', 'men navigation');
  await evaluate('Array.from(document.querySelectorAll(\'a[href="/women"]\')).find(a => a.textContent.trim().toLowerCase() === "women")?.click()');
  await waitFor('location.pathname === "/women" && document.querySelector("h1")?.textContent.toLowerCase().includes("women")', 'women navigation');
  pass('shop navigation updates filters');

  // Open only the client-side demo view; no authenticated writes are sent.
  await evaluate('localStorage.setItem("homiesAuth", JSON.stringify({user: {name: "Browser Demo", email: "demo@example.invalid"}, token: "browser-view-only"}))');
  await navigate('/checkout');
  await waitFor('document.body.textContent.includes("Online payments are simulated")', 'checkout demo notice');
  assert.ok(await evaluate('document.body.textContent.includes("payment remains pending")'));
  assert.ok(await evaluate('!!document.querySelector(\'input[value="Cash on Delivery"]:checked\')'));
  pass('checkout defaults to COD and labels simulated online payments');

  await navigate('/cart');
  await clickButton('Remove');
  await waitFor('document.body.textContent.includes("Your Cart is Empty")', 'remove from cart');
  pass('cart removal');
  assert.equal(runtimeErrors.length, 0, 'no uncaught browser exceptions');
  pass('no uncaught React/runtime exceptions');
  await send('Browser.close').catch(() => {});
}

main().catch((error) => {
  console.error('FAIL browser:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ id: 999999, method: 'Browser.close' }));
    await delay(1000);
  }
  if (socket) socket.close();
  if (browser && browser.exitCode === null) {
    browser.kill();
    await Promise.race([new Promise((resolve) => browser.once('exit', resolve)), delay(5000)]);
  }
  if (apiServer) await new Promise((resolve) => apiServer.close(resolve));
  if (frontendServer) await new Promise((resolve) => frontendServer.close(resolve));
  await require('mongoose').disconnect();
  // Verify the exact target before removing only this isolated browser profile.
  if (profile && path.dirname(path.resolve(profile)) === path.resolve(os.tmpdir()) &&
      path.basename(profile).startsWith('homies-readiness-')) {
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 }); }
    catch { console.error('Temporary browser profile could not be removed.'); process.exitCode = 1; }
  }
});
