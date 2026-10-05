const Product = require('../models/Product');

const mapProduct = (product) => ({
  id: product._id.toString(),
  _id: product._id.toString(),
  name: product.name,
  slug: product.slug || '',
  sku: product.sku || '',
  description: product.description,
  price: Number(product.price),
  discountPrice: Number(product.discountPrice || product.discount_price || 0),
  category: product.category,
  collection: product.product_collection || '',
  brand: product.brand || '',
  sizes: product.sizes || [],
  colors: product.colors || [],
  stock: Number(product.stock || 0),
  images: product.images || [],
  gender: product.gender || 'unisex',
  style: product.style || 'Streetwear',
  occasion: product.occasion || [],
  season: product.season || 'All Season',
  fit: product.fit || 'Oversized',
  rating: Number(product.rating || 0),
});

const calculateScore = (product, prefs) => {
  let score = 0;
  const pStyle = (product.style || '').toLowerCase();
  const reqStyle = (prefs.style || '').toLowerCase();
  if (reqStyle && pStyle.includes(reqStyle)) score += 30;

  const pOccasion = (product.occasion || []).map((o) => o.toLowerCase());
  const reqOccasion = (prefs.occasion || '').toLowerCase();
  if (reqOccasion && pOccasion.some((o) => o.includes(reqOccasion))) score += 25;

  const pColors = (product.colors || []).map((c) => c.toLowerCase());
  const reqColor = (prefs.color || '').toLowerCase();
  if (reqColor && pColors.some((c) => c.includes(reqColor))) score += 15;

  const finalPrice = product.price - (product.discountPrice || 0);
  const reqBudget = Number(prefs.budget || 10000);
  if (finalPrice <= reqBudget) score += 15;

  const pGender = (product.gender || 'unisex').toLowerCase();
  const reqGender = (prefs.gender || '').toLowerCase();
  if (!reqGender || pGender === 'unisex' || pGender === reqGender) score += 10;

  const pFit = (product.fit || '').toLowerCase();
  const reqFit = (prefs.fit || '').toLowerCase();
  if (reqFit && pFit.includes(reqFit)) score += 5;

  return score;
};

const classifyProduct = (product) => {
  const slots = [
    ['dress', ['dress']],
    ['accessory', ['cap', 'wallet', 'bag', 'tote', 'sunglasses', 'accessory']],
    ['footwear', ['shoe', 'sneaker', 'boot', 'footwear']],
    ['bottom', ['pant', 'pants', 'jeans', 'trouser', 'trousers', 'cargo', 'short', 'shorts', 'bottom', 'jogger', 'joggers', 'skirt']],
    ['top', ['t-shirt', 'shirt', 'hoodie', 'jacket', 'top', 'sweatshirt']],
  ];
  // Prefer the category so a name such as "Short Sleeve Shirt" stays a top.
  for (const value of [product.category, product.name]) {
    const text = (value || '').toLowerCase();
    const slot = slots.find(([, keywords]) => keywords.some((word) => text.includes(word)))?.[0];
    if (slot) return slot;
  }
  return undefined;
};

// Search the small catalog rather than choosing a greedy outfit and trimming it.
// Scores stay unchanged; one item per slot and dresses only with accessories.
const selectOutfit = (products, prefs) => {
  const budgetCents = Math.floor(prefs.budget * 100 + 1e-7);
  const seenIds = new Set();
  const candidates = products.flatMap((product) => {
    const id = product._id.toString();
    const effectivePrice = Number(product.price) - Number(product.discountPrice || 0);
    const cost = Math.round(effectivePrice * 100);
    const slot = classifyProduct(product);
    if (seenIds.has(id) || !slot || !Number.isFinite(effectivePrice) ||
        effectivePrice < 0 || effectivePrice > prefs.budget || cost > budgetCents) return [];
    seenIds.add(id);
    return [{ product, id, slot, cost, score: calculateScore(product, prefs) }];
  }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

  const hasMainItem = candidates.some((item) => ['top', 'bottom', 'dress'].includes(item.slot));
  let best = null;
  const consider = (items, cost) => {
    const slots = items.map((item) => item.slot);
    if (hasMainItem && !slots.some((slot) => ['top', 'bottom', 'dress'].includes(slot))) return;
    if (!hasMainItem && items.length > 1) return;
    const score = items.reduce((sum, item) => sum + item.score, 0);
    const coverage = slots.includes('dress') ? 2 : Number(slots.includes('top')) + Number(slots.includes('bottom'));
    const key = items.map((item) => item.id).join('|');
    if (!best || score > best.score ||
        (score === best.score && (coverage > best.coverage ||
          (coverage === best.coverage && (cost < best.cost ||
            (cost === best.cost && key < best.key)))))) {
      best = { items: [...items], cost, score, coverage, key };
    }
  };
  const search = (start, items, cost) => {
    if (items.length) consider(items, cost);
    if (items.length === 3) return;
    for (let index = start; index < candidates.length; index += 1) {
      const next = candidates[index];
      if (cost + next.cost > budgetCents || items.some((item) => item.slot === next.slot)) continue;
      if (next.slot === 'dress' && items.some((item) => item.slot !== 'accessory')) continue;
      if (items.some((item) => item.slot === 'dress') && next.slot !== 'accessory') continue;
      search(index + 1, [...items, next], cost + next.cost);
    }
  };
  search(0, [], 0);
  const slotOrder = ['dress', 'top', 'bottom', 'footwear', 'accessory'];
  return {
    products: (best?.items || []).sort((a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot)).map((item) => item.product),
    totalCost: (best?.cost || 0) / 100,
  };
};

const getStylistRecommendation = async (req, res) => {
  try {
    const { gender, occasion, style, color, fit } = req.body;
    const budget = req.body.budget === undefined ? 5000 : Number(req.body.budget);
    if (!Number.isFinite(budget) || budget <= 0 || Math.floor(budget * 100) > Number.MAX_SAFE_INTEGER) {
      return res.status(400).json({ success: false, message: 'Please select a valid positive budget.' });
    }

    const genderFilter = ['men', 'women'].includes(String(gender).toLowerCase())
      ? { $in: [String(gender).toLowerCase(), 'unisex'] }
      : { $in: ['men', 'women', 'unisex'] };

    // Fetch real in-stock products from the selected catalog.
    const products = await Product.find({ stock: { $gt: 0 }, gender: genderFilter });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No in-stock products available in MongoDB to create recommendations.',
      });
    }

    const selection = selectOutfit(products, { gender, occasion, style, color, budget, fit });
    if (selection.products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No suitable in-stock items fit the selected budget. Please increase your budget.',
      });
    }
    const recommendedOutfit = selection.products.map(mapProduct);
    const totalOutfitCost = selection.totalCost;
    let explanation = 'Recommended based on your style, occasion, color, fit and budget.';
    if (recommendedOutfit.length < 3) {
      explanation += recommendedOutfit.some((item) => classifyProduct(item) === 'dress')
        ? ' A dress is a standalone look, with an optional accessory within your budget.'
        : ' The Stylist selected the best matching items within your requested budget; fewer than three suitable items were selected.';
    }

    res.json({
      success: true,
      data: {
        outfit: recommendedOutfit,
        totalCost: Number(totalOutfitCost.toFixed(2)),
        explanation,
        preferences: { gender, occasion, style, color, budget, fit },
      },
    });
  } catch (error) {
    console.error('Stylist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStylistRecommendation,
};
