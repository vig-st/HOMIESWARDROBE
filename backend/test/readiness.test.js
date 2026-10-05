const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');

test('startup fails without JWT configuration or with unavailable MongoDB', () => {
  for (const overrides of [
    { JWT_SECRET: '' },
    { MONGO_URI: 'mongodb://127.0.0.1:1/readiness_probe', JWT_SECRET: randomBytes(32).toString('hex') },
  ]) {
    const child = spawnSync(process.execPath, ['server.js'], {
      cwd: backendDir,
      env: { ...process.env, ...overrides },
      encoding: 'utf8',
      timeout: 120000,
      windowsHide: true,
    });
    assert.equal(child.status, 1, 'startup must fail');
    assert.ok(!child.stdout.includes('Server started'), 'must not listen after startup failure');
    assert.ok(child.stderr.includes('Server startup failed'), 'must explain startup failure');
    assert.ok(!child.stderr.includes('mongodb://'), 'must not print connection details');
  }
});

test('Atlas readiness regressions (temporary records, cleaned in finally)', {
  skip: process.env.RUN_ATLAS_TESTS !== '1',
  timeout: 240000,
}, async (t) => {
  require('dotenv').config({ path: path.join(backendDir, '.env'), quiet: true });
  process.env.PORT = '0';
  const mongoose = require('mongoose');
  const { startServer } = require('../server');
  const User = require('../models/User');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const Settings = require('../models/StoreSettings');
  const runId = randomUUID();
  const emails = [0, 1].map((n) => 'readiness-' + runId + '-' + n + '@example.invalid');
  const password = randomBytes(24).toString('base64url');
  const productIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  let server;
  let baseURL;
  let originalStocks;
  let cleanupDone = false;
  const originalCreate = Order.create;
  const request = async (route, { method = 'GET', body, token } = {}) => {
    const response = await fetch(baseURL + route, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    return { status: response.status, data: await response.json() };
  };
  const cleanup = async () => {
    Order.create = originalCreate;
    if (mongoose.connection.readyState !== 1) return;
    const users = await User.find({ email: { $in: emails } }).select('_id');
    const ids = users.map((user) => user._id);
    await Order.deleteMany({ user: { $in: ids } });
    await Product.deleteMany({ _id: { $in: productIds } });
    await User.deleteMany({ _id: { $in: ids }, email: { $in: emails } });
    assert.equal(await Order.countDocuments({ user: { $in: ids } }), 0);
    assert.equal(await Product.countDocuments({ _id: { $in: productIds } }), 0);
    assert.equal(await User.countDocuments({ email: { $in: emails } }), 0);
    cleanupDone = true;
  };

  try {
    server = await startServer();
    baseURL = 'http://127.0.0.1:' + server.address().port;

    await t.test('health reports HTTP 200 / connected', async () => {
      const response = await request('/api/health');
      assert.equal(response.status, 200);
      assert.equal(response.data.status, 'ok');
      assert.equal(response.data.mongodb, 'connected');
    });
    for (const [query, count] of [['', 25], ['?gender=men', 14], ['?gender=women', 15]]) {
      await t.test('catalog ' + (query || 'all') + ' = ' + count, async () => {
        const response = await request('/api/products' + query);
        assert.equal(response.status, 200);
        assert.equal(response.data.data.length, count);
      });
    }
    originalStocks = await Product.find().select('_id stock').lean();
    await t.test('AI stylist recommends catalog products', async () => {
      const response = await request('/api/stylist/recommend', {
        method: 'POST',
        body: { gender: 'men', style: 'Streetwear', occasion: 'Casual', budget: 10000 },
      });
      assert.equal(response.status, 200);
      assert.ok(response.data.data.outfit.length > 0);
    });

    const customers = [];
    for (const email of emails) {
      const response = await request('/api/auth/register', {
        method: 'POST', body: { name: 'Readiness Test ' + runId, email, password },
      });
      assert.equal(response.status, 201, 'temporary registration succeeds');
      assert.ok(response.data.token, 'registration returns authentication');
      customers.push(response.data);
    }
    await t.test('registration, login, profile and authentication protection', async () => {
      const login = await request('/api/auth/login', { method: 'POST', body: { email: emails[0], password } });
      assert.equal(login.status, 200);
      assert.ok(login.data.token);
      const profile = await request('/api/auth/me', { token: login.data.token });
      assert.equal(profile.status, 200);
      assert.equal(profile.data._id, customers[0]._id);
      assert.ok(!('password' in profile.data));
      assert.equal((await request('/api/auth/me')).status, 401);
      assert.equal((await request('/api/orders/my-orders')).status, 401);
      assert.equal((await request('/api/auth/login', {
        method: 'POST', body: { email: emails[0], password: randomBytes(24).toString('hex') },
      })).status, 401);
    });

    await Product.create([
      { _id: productIds[0], name: 'Readiness inventory ' + runId, sku: 'test-' + runId + '-0', category: 'Test', gender: 'unisex', price: 100, discountPrice: 10, stock: 8, sizes: ['M'], colors: ['Black'] },
      { _id: productIds[1], name: 'Readiness concurrency ' + runId, sku: 'test-' + runId + '-1', category: 'Test', gender: 'unisex', price: 100, stock: 1 },
    ]);
    const shippingAddress = {
      fullName: 'Readiness Test', email: emails[0], phone: '0000000000',
      address: 'Demo test address', city: 'Test', state: 'Test', zip: '000000', country: 'India',
    };
    const payload = {
      items: [{ product: productIds[0].toString(), quantity: 1, size: 'M', color: 'Black', price: 0 }],
      shippingAddress, paymentMethod: 'Cash on Delivery', totalAmount: 0, paymentStatus: 'paid',
    };
    const place = (body = payload, token = customers[0].token) => request('/api/orders', { method: 'POST', body, token });
    const stock = async (id = productIds[0]) => (await Product.findById(id)).stock;
    const orderCount = () => Order.countDocuments({ user: customers[0]._id });

    let cod;
    await t.test('COD checkout uses server totals and pending payment', async () => {
      const before = await stock();
      const response = await place();
      assert.equal(response.status, 201);
      cod = response.data.data;
      const settings = await Settings.findOne();
      const shipping = 90 >= (settings?.freeShippingMinimum ?? 999) ? 0 : (settings?.shippingFee ?? 50);
      const tax = Number((90 * (settings?.taxRate ?? 18) / 100).toFixed(2));
      assert.equal(cod.subtotal, 90);
      assert.equal(cod.totalAmount, Number((90 + shipping + tax).toFixed(2)));
      assert.equal(cod.paymentStatus, 'pending');
      assert.equal(cod.paymentMethod, 'Cash on Delivery');
      assert.equal(await stock(), before - 1);
    });
    await t.test('history and order ownership protection', async () => {
      assert.ok(cod);
      const history = await request('/api/orders/my-orders', { token: customers[0].token });
      assert.equal(history.status, 200);
      assert.ok(history.data.data.some((order) => order._id === cod._id));
      assert.equal((await request('/api/orders/' + cod._id, { token: customers[0].token })).status, 200);
      assert.equal((await request('/api/orders/' + cod._id, { token: customers[1].token })).status, 403);
      assert.equal((await request('/api/orders/' + cod._id)).status, 401);
      const other = await request('/api/orders/my-orders', { token: customers[1].token });
      assert.equal(other.data.data.length, 0);
    });
    await t.test('both online methods remain pending and explicitly Demo', async () => {
      for (const paymentMethod of ['UPI', 'Credit / Debit Card']) {
        const response = await place({ ...payload, paymentMethod });
        assert.equal(response.status, 201);
        assert.equal(response.data.data.paymentStatus, 'pending');
        assert.equal(response.data.data.paymentMethod, paymentMethod + ' (Demo)');
      }
    });
    await t.test('invalid quantities, payment and address cannot reduce stock', async () => {
      const before = await stock();
      const count = await orderCount();
      for (const quantity of [0, -1, 1.5, '2', null]) {
        const response = await place({ ...payload, items: [{ product: productIds[0].toString(), quantity }] });
        assert.equal(response.status, 400);
      }
      assert.equal((await place({ ...payload, paymentMethod: 'verified' })).status, 400);
      assert.equal((await place({ ...payload, shippingAddress: {} })).status, 400);
      assert.equal(await stock(), before);
      assert.equal(await orderCount(), count);
    });
    await t.test('later insufficient item and duplicate quantities leave inventory unchanged', async () => {
      const before = await stock();
      const count = await orderCount();
      const secondBefore = await stock(productIds[1]);
      const failed = await place({ ...payload, items: [
        payload.items[0], { product: productIds[1].toString(), quantity: secondBefore + 1 },
      ] });
      assert.equal(failed.status, 409);
      const duplicate = await place({ ...payload, items: [
        { ...payload.items[0], quantity: before }, payload.items[0],
      ] });
      assert.equal(duplicate.status, 409);
      assert.equal(await stock(), before);
      assert.equal(await stock(productIds[1]), secondBefore);
      assert.equal(await orderCount(), count);
    });
    await t.test('failure after inventory writes aborts the entire transaction', async () => {
      const before = await stock();
      const count = await orderCount();
      let reachedOrder = false;
      Order.create = async function (docs, options) {
        const inTransaction = await Product.findById(productIds[0]).session(options.session);
        assert.equal(inTransaction.stock, before - 1, 'inventory write must have happened');
        reachedOrder = true;
        throw new Error('Injected order persistence failure');
      };
      try {
        assert.equal((await place()).status, 500);
        assert.ok(reachedOrder, 'must exercise rollback after writes');
      } finally {
        Order.create = originalCreate;
      }
      assert.equal(await stock(), before);
      assert.equal(await orderCount(), count);
    });
    await t.test('two concurrent checkouts for the last unit cannot oversell', async () => {
      const body = { ...payload, items: [{ product: productIds[1].toString(), quantity: 1 }] };
      const results = await Promise.all([place(body), place(body)]);
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
      assert.equal(await stock(productIds[1]), 0);
    });
    await t.test('cleanup removes only test records and preserves catalog stock', async () => {
      await cleanup();
      const currentStocks = await Product.find().select('_id stock').lean();
      const expected = new Map(originalStocks.map((p) => [p._id.toString(), p.stock]));
      assert.equal(currentStocks.length, originalStocks.length);
      for (const product of currentStocks) assert.equal(product.stock, expected.get(product._id.toString()));
    });
    await t.test('health becomes HTTP 503 / degraded when MongoDB disconnects', async () => {
      await mongoose.disconnect();
      const response = await request('/api/health');
      assert.equal(response.status, 503);
      assert.equal(response.data.status, 'degraded');
      assert.equal(response.data.mongodb, 'disconnected');
    });
  } finally {
    Order.create = originalCreate;
    if (!cleanupDone && mongoose.connection.readyState === 1) await cleanup();
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
});
