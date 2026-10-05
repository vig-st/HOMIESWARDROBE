const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const loadController = (file, dependencies) => {
  const context = { require: (name) => dependencies[name], module: { exports: {} }, console, process,
    __dirname: path.resolve(__dirname, '../controllers') };
  vm.runInNewContext(fs.readFileSync(path.join(context.__dirname, file), 'utf8'), context);
  return context.module.exports;
};
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const preferences = { gender: 'men', style: 'Streetwear', occasion: 'College', color: 'Black', fit: 'Oversized', budget: 5000 };
const product = (id, category, price, overrides = {}) => ({ _id: id, name: category, category, price,
  discountPrice: 0, stock: 5, gender: 'unisex', style: 'Streetwear', occasion: ['College'], colors: ['Black'], fit: 'Oversized', ...overrides });
const recommend = async (catalog, prefs = preferences) => {
  const controller = loadController('stylistController.js', { '../models/Product': {
    find: async (filter) => catalog.filter((p) => p.stock > filter.stock.$gt && filter.gender.$in.includes(p.gender)),
  } });
  const res = response();
  await controller.getStylistRecommendation({ body: prefs }, res);
  return res;
};
const check = (result, prefs, catalog) => {
  assert.equal(result.statusCode, 200);
  const { outfit, totalCost } = result.body.data;
  assert.ok(outfit.length >= 1 && outfit.length <= 3);
  assert.equal(new Set(outfit.map((p) => p.id)).size, outfit.length);
  assert.ok(totalCost <= prefs.budget);
  assert.equal(totalCost, Math.round(outfit.reduce((sum, p) => sum + Math.round((p.price - p.discountPrice) * 100), 0)) / 100);
  for (const item of outfit) {
    assert.ok(catalog.some((p) => p._id.toString() === item.id));
    assert.ok(item.stock > 0);
    assert.ok([prefs.gender, 'unisex'].includes(item.gender));
    assert.ok(item.price - item.discountPrice <= prefs.budget);
  }
  return outfit;
};

test('budget search finds a better affordable combination instead of trimming greedy winners', async () => {
  const catalog = [product('1', 'T-Shirts', 2000), product('2', 'T-Shirts', 800, { colors: ['White'] }), product('3', 'Joggers', 1000), product('4', 'Caps', 500)];
  const prefs = { ...preferences, budget: 2300 };
  const outfit = check(await recommend(catalog, prefs), prefs, catalog);
  assert.deepEqual(Array.from(outfit, (p) => p.id), ['2', '3', '4']);
});
test('returns three, two, one or a clear no-affordable-item error', async () => {
  const catalog = [product('1', 'T-Shirts', 900), product('2', 'Joggers', 1400), product('3', 'Caps', 600)];
  for (const [budget, length] of [[3000, 3], [1500, 2], [1000, 1]]) {
    const prefs = { ...preferences, budget };
    assert.equal(check(await recommend(catalog, prefs), prefs, catalog).length, length);
  }
  assert.equal((await recommend(catalog, { ...preferences, budget: 500 })).statusCode, 404);
});
test('classification keeps joggers/skirts in bottoms and accessories separate', async () => {
  for (const bottom of ['Joggers', 'Skirts', 'Pants', 'Trousers', 'Shorts']) {
    const catalog = [product('1', 'Crop Tops', 100), product('2', bottom, 100), product('3', 'Tote Bags', 100)];
    const outfit = check(await recommend(catalog), preferences, catalog);
    assert.deepEqual(Array.from(outfit, (p) => p.category), ['Crop Tops', bottom, 'Tote Bags']);
  }
});
test('dress is standalone or with one accessory; never top, bottom or footwear', async () => {
  const catalog = [product('1', 'Dresses', 1000), product('2', 'Caps', 500), product('3', 'T-Shirts', 4000), product('4', 'Pants', 4000), product('5', 'Sneakers', 500)];
  const prefs = { ...preferences, budget: 1500 };
  assert.deepEqual(Array.from(check(await recommend(catalog, prefs), prefs, catalog), (p) => p.category), ['Dresses', 'Caps']);
});
test('accessory cannot displace a higher scoring footwear option', async () => {
  const catalog = [product('1', 'T-Shirts', 100), product('2', 'Pants', 100), product('3', 'Sneakers', 100), product('4', 'Caps', 100, { style: 'Minimal', colors: ['White'] })];
  assert.deepEqual(Array.from(check(await recommend(catalog), preferences, catalog), (p) => p.category), ['T-Shirts', 'Pants', 'Sneakers']);
});
test('discounts, cents, gender, stock, uniqueness and deterministic ties', async () => {
  const catalog = [product('b', 'T-Shirts', 100, { discountPrice: 80 }), product('a', 'T-Shirts', 20),
    product('c', 'Pants', 10.1), product('d', 'Caps', 0.2), product('e', 'Dresses', 1, { gender: 'women' }),
    product('f', 'Dresses', 1, { stock: 0 }), product('g', 'Dresses', 1, { discountPrice: 2 })];
  const prefs = { ...preferences, budget: 30.3 };
  const first = check(await recommend(catalog, prefs), prefs, catalog);
  const second = check(await recommend([...catalog].reverse(), prefs), prefs, catalog);
  assert.deepEqual(Array.from(first, (p) => p.id), ['a', 'c', 'd']);
  assert.deepEqual(Array.from(second, (p) => p.id), Array.from(first, (p) => p.id));
});
test('rejects invalid budgets before querying products', async () => {
  for (const budget of [0, -1, '', 'bad', null, Infinity]) {
    assert.equal((await recommend([], { ...preferences, budget })).statusCode, 400);
  }
});
test('Product Detail mapping preserves zero and real ratings and filters gallery files', async () => {
  for (const [rating, numReviews] of [[0, 0], [5, 1], [undefined, undefined]]) {
    const p = product('1', 'T-Shirts', 100, { rating, numReviews, images: [
      '/uploads/products/men/men-black-oversized-t-shirt/01-front.jpg', '/uploads/products/not-present.jpg',
    ] });
    const controller = loadController('productController.js', { fs, path,
      mongoose: { connection: { readyState: 1 } }, '../models/Product': { findById: async () => p },
      '../models/Review': {}, '../product': [] });
    const res = response();
    await controller.getProductById({ params: { id: '1' } }, res);
    assert.equal(res.body.data.rating, rating ?? 0);
    assert.equal(res.body.data.numReviews, numReviews ?? 0);
    assert.equal(res.body.data.images.length, 1);
  }
});

const scenarios = [
  ['Men Streetwear 5000', { ...preferences }],
  ['Men Streetwear 1500', { ...preferences, budget: 1500 }],
  ['Men Sporty Gym / joggers', { ...preferences, style: 'Sporty', occasion: 'Gym', fit: 'Slim', budget: 3000 }],
  ['Women Streetwear', { ...preferences, gender: 'women', fit: 'Slim', budget: 3000 }],
  ['Women Minimal Date', { ...preferences, gender: 'women', style: 'Minimal', occasion: 'Date', fit: 'Slim', budget: 4000 }],
  ['Women Sporty College / skirt', { ...preferences, gender: 'women', style: 'Sporty', color: 'White', fit: 'Regular', budget: 3000 }],
  ['Women Minimal Party / dress', { ...preferences, gender: 'women', style: 'Minimal', occasion: 'Party', fit: 'Slim', budget: 3500 }],
];
test('read-only Atlas: requested scenarios, real IDs, front images and unchanged records', {
  skip: process.env.RUN_STYLIST_ATLAS_TESTS !== '1',
}, async () => {
  const { createRequire } = require('node:module');
  const { MongoClient } = createRequire(require.resolve('mongoose'))('mongodb');
  const env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '../.env')));
  const client = new MongoClient(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const collection = client.db().collection('products');
    const catalog = await collection.find({}).toArray();
    assert.equal(catalog.length, 25);
    for (const [name, prefs] of scenarios) {
      const result = await recommend(catalog, prefs);
      const outfit = check(result, prefs, catalog);
      const slots = outfit.map((p) => /dress/i.test(p.category) ? 'dress' : /cap|wallet|bag|tote|sunglasses|accessory/i.test(p.category) ? 'accessory' : /pant|jeans|trouser|cargo|short|bottom|jogger|skirt/i.test(p.category) ? 'bottom' : 'top');
      assert.equal(new Set(slots).size, slots.length);
      if (slots.includes('dress')) assert.ok(slots.every((slot) => ['dress', 'accessory'].includes(slot)));
      if (name.includes('joggers')) assert.ok(outfit.some((p) => /jogger/i.test(p.name)));
      if (name.includes('skirt')) assert.ok(outfit.some((p) => /skirt/i.test(p.name)));
      if (name.includes('dress')) assert.ok(outfit.some((p) => /dress/i.test(p.name)));
      for (const p of outfit) {
        assert.ok(p.images[0].endsWith('/01-front.jpg'));
        assert.ok(fs.existsSync(path.join(__dirname, '..', p.images[0].replace(/^\//, ''))));
      }
      console.log(JSON.stringify({ scenario: name, budget: prefs.budget, total: result.body.data.totalCost, count: outfit.length, products: outfit.map((p) => p.name) }));
    }
    assert.deepEqual(await collection.find({}).toArray(), catalog, 'catalog must remain unchanged');
  } finally { await client.close(); }
});
