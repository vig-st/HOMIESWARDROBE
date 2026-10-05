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

const getStylistRecommendation = async (req, res) => {
  try {
    const { gender, occasion, style, color, budget, fit } = req.body;

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

    const scoredProducts = products.map((p) => ({
      product: p,
      score: calculateScore(p, { gender, occasion, style, color, budget, fit }),
    }));

    // Sort by highest recommendation score
    scoredProducts.sort((a, b) => b.score - a.score);

    // Group into outfit slots: top, bottom, shoes, accessory
    const topKeywords = ['t-shirt', 'shirt', 'hoodie', 'jacket', 'top', 'sweatshirt'];
    const bottomKeywords = ['pant', 'jeans', 'trouser', 'cargo', 'shorts', 'bottom'];
    const shoeKeywords = ['shoe', 'sneaker', 'boot', 'footwear'];

    let topItem = null;
    let bottomItem = null;
    let shoeItem = null;
    const extraItems = [];

    for (const item of scoredProducts) {
      const p = item.product;
      const cat = (p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();

      if (!topItem && topKeywords.some((k) => cat.includes(k) || name.includes(k))) {
        topItem = p;
      } else if (!bottomItem && bottomKeywords.some((k) => cat.includes(k) || name.includes(k))) {
        bottomItem = p;
      } else if (!shoeItem && shoeKeywords.some((k) => cat.includes(k) || name.includes(k))) {
        shoeItem = p;
      } else {
        extraItems.push(p);
      }
    }

    // Assemble outfit array
    const recommendedOutfit = [];
    if (topItem) recommendedOutfit.push(mapProduct(topItem));
    if (bottomItem) recommendedOutfit.push(mapProduct(bottomItem));
    if (shoeItem) recommendedOutfit.push(mapProduct(shoeItem));

    // Fill remaining slots up to 3-4 items if top/bottom/shoes were missing
    for (const item of extraItems) {
      if (recommendedOutfit.length >= 3) break;
      if (!recommendedOutfit.some((r) => r.id === item._id.toString())) {
        recommendedOutfit.push(mapProduct(item));
      }
    }

    // Fallback: if outfit is still empty, return top scored products
    if (recommendedOutfit.length === 0) {
      scoredProducts.slice(0, 3).forEach((sp) => {
        recommendedOutfit.push(mapProduct(sp.product));
      });
    }

    const totalOutfitCost = recommendedOutfit.reduce(
      (sum, item) => sum + (item.price - (item.discountPrice || 0)),
      0
    );

    const explanation = `Selected ${recommendedOutfit.length} curated pieces matching your ${style || 'Streetwear'} aesthetic for ${occasion || 'Casual'} wear. Fits within your budget of ₹${budget || 5000}.`;

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
