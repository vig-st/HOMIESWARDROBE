require("dotenv").config();
const connectDB = require("./config/db");
const Product = require("./models/Product");
const Category = require('./models/Category');
const StoreSettings = require('./models/StoreSettings');

const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const gallerySpecMap = {
  'men-black-oversized-t-shirt': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-neck-detail.jpg' },
  'men-graphic-city-t-shirt': { f4: '04-model.jpg', f5: '05-graphic-detail.jpg', f6: '06-neck-detail.jpg' },
  'men-oxford-casual-shirt': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-collar-detail.jpg' },
  'men-red-flannel-shirt': { f4: '04-model.jpg', f5: '05-flannel-detail.jpg', f6: '06-collar-detail.jpg' },
  'men-pullover-hoodie': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-hood-detail.jpg' },
  'men-utility-cargo-pants': { f4: '04-model.jpg', f5: '05-pocket-detail.jpg', f6: '06-waist-detail.jpg' },
  'men-straight-fit-jeans': { f4: '04-model.jpg', f5: '05-denim-detail.jpg', f6: '06-waist-detail.jpg' },
  'men-tapered-joggers': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-waist-detail.jpg' },
  'men-canvas-baseball-cap': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-strap-detail.jpg' },
  'men-leather-card-wallet': { f4: '04-open-view.jpg', f5: '05-leather-detail.jpg', f6: '06-card-slot-detail.jpg' },

  'women-ribbed-crop-top': { f4: '04-model.jpg', f5: '05-ribbed-detail.jpg', f6: '06-neck-detail.jpg' },
  'women-graphic-baby-tee': { f4: '04-model.jpg', f5: '05-graphic-detail.jpg', f6: '06-neck-detail.jpg' },
  'women-linen-oversized-shirt': { f4: '04-model.jpg', f5: '05-linen-detail.jpg', f6: '06-collar-detail.jpg' },
  'women-cropped-hoodie': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-hood-detail.jpg' },
  'women-wide-leg-jeans': { f4: '04-model.jpg', f5: '05-denim-detail.jpg', f6: '06-waist-detail.jpg' },
  'women-utility-cargo-pants': { f4: '04-model.jpg', f5: '05-pocket-detail.jpg', f6: '06-waist-detail.jpg' },
  'women-pleated-tennis-skirt': { f4: '04-model.jpg', f5: '05-pleat-detail.jpg', f6: '06-waist-detail.jpg' },
  'women-satin-slip-dress': { f4: '04-model.jpg', f5: '05-satin-detail.jpg', f6: '06-strap-detail.jpg' },
  'women-relaxed-joggers': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-waist-detail.jpg' },
  'women-structured-tote-bag': { f4: '04-model.jpg', f5: '05-interior-detail.jpg', f6: '06-handle-detail.jpg' },
  'women-round-frame-sunglasses': { f4: '04-model.jpg', f5: '05-lens-detail.jpg', f6: '06-frame-detail.jpg' },

  'unisex-oversized-hoodie': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-hood-detail.jpg' },
  'unisex-cargo-pants': { f4: '04-model.jpg', f5: '05-pocket-detail.jpg', f6: '06-waist-detail.jpg' },
  'unisex-everyday-sweatshirt': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-neck-detail.jpg' },
  'unisex-classic-sweatshirt': { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-neck-detail.jpg' },
};

const buildGalleryImages = (gender, slug) => {
  const folderName = slug.startsWith('unisex-') ? slug.replace(/^unisex-/, '') : slug;
  const basePath = `/uploads/products/${gender}/${folderName}`;
  const spec = gallerySpecMap[slug] || { f4: '04-model.jpg', f5: '05-fabric-detail.jpg', f6: '06-neck-detail.jpg' };
  
  return [
    `${basePath}/01-front.jpg`,
    `${basePath}/02-back.jpg`,
    `${basePath}/03-side.jpg`,
    `${basePath}/${spec.f4}`,
    `${basePath}/${spec.f5}`,
    `${basePath}/${spec.f6}`,
  ];
};

const makeProduct = ({
  name, slug, sku, gender, category, price, image, sizes, colors, stock, style, occasion, season, fit, tags,
}) => ({
  name,
  slug,
  sku,
  gender,
  category,
  price,
  discountPrice: 0,
  description: `${name} designed for the ${gender === 'men' ? "men's" : "women's"} wardrobe.`,
  images: buildGalleryImages(gender, slug),
  sizes,
  colors,
  stock,
  style,
  occasion,
  season,
  fit,
  tags,
  featured: false,
  bestSeller: false,
  newArrival: true,
});

const seedProducts = [
  makeProduct({ name: 'Men Black Oversized T-Shirt', slug: 'men-black-oversized-t-shirt', sku: 'MEN-TEE-001', gender: 'men', category: 'Oversized T-Shirts', price: 999, image: 'photo-1521572163474-6864f9cf17ab', sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Black'], stock: 18, style: 'Streetwear', occasion: ['Casual', 'College'], season: 'All Season', fit: 'Oversized', tags: ['t-shirt', 'everyday'] }),
  makeProduct({ name: 'Men Graphic City T-Shirt', slug: 'men-graphic-city-t-shirt', sku: 'MEN-TEE-002', gender: 'men', category: 'Graphic T-Shirts', price: 1099, image: 'photo-1503341504253-dff4815485f1', sizes: ['M', 'L', 'XL'], colors: ['White', 'Black'], stock: 14, style: 'Streetwear', occasion: ['Casual', 'College'], season: 'Summer', fit: 'Regular', tags: ['graphic', 't-shirt'] }),
  makeProduct({ name: 'Men Oxford Casual Shirt', slug: 'men-oxford-casual-shirt', sku: 'MEN-SHR-001', gender: 'men', category: 'Casual Shirts', price: 1599, image: 'photo-1602810318383-e386cc2a3ccf', sizes: ['M', 'L', 'XL'], colors: ['Blue'], stock: 11, style: 'Smart Casual', occasion: ['Office', 'Casual'], season: 'All Season', fit: 'Regular', tags: ['shirt', 'oxford'] }),
  makeProduct({ name: 'Men Red Flannel Shirt', slug: 'men-red-flannel-shirt', sku: 'MEN-SHR-002', gender: 'men', category: 'Flannel Shirts', price: 1799, image: 'photo-1596755094514-f87e34085b2c', sizes: ['M', 'L', 'XL'], colors: ['Red', 'Black'], stock: 9, style: 'Streetwear', occasion: ['Casual', 'Travel'], season: 'Winter', fit: 'Relaxed', tags: ['flannel', 'layering'] }),
  makeProduct({ name: 'Men Pullover Hoodie', slug: 'men-pullover-hoodie', sku: 'MEN-HOD-001', gender: 'men', category: 'Hoodies', price: 2199, image: 'photo-1556821840-3a63f95609a7', sizes: ['M', 'L', 'XL', 'XXL'], colors: ['Grey'], stock: 13, style: 'Streetwear', occasion: ['Casual', 'College'], season: 'Winter', fit: 'Oversized', tags: ['hoodie', 'layering'] }),
  makeProduct({ name: 'Men Utility Cargo Pants', slug: 'men-utility-cargo-pants', sku: 'MEN-CAR-001', gender: 'men', category: 'Cargo Pants', price: 1999, image: 'photo-1517438476312-10d79c077509', sizes: ['M', 'L', 'XL'], colors: ['Olive'], stock: 12, style: 'Streetwear', occasion: ['Casual', 'Travel'], season: 'All Season', fit: 'Relaxed', tags: ['cargo', 'utility'] }),
  makeProduct({ name: 'Men Straight Fit Jeans', slug: 'men-straight-fit-jeans', sku: 'MEN-JEA-001', gender: 'men', category: 'Straight Jeans', price: 2299, image: 'photo-1542272604-787c3835535d', sizes: ['30', '32', '34', '36'], colors: ['Blue'], stock: 10, style: 'Casual', occasion: ['Casual', 'College'], season: 'All Season', fit: 'Straight', tags: ['jeans', 'denim'] }),
  makeProduct({ name: 'Men Tapered Joggers', slug: 'men-tapered-joggers', sku: 'MEN-JOG-001', gender: 'men', category: 'Joggers', price: 1499, image: 'photo-1552902865-b72c031ac5ea', sizes: ['M', 'L', 'XL'], colors: ['Black'], stock: 16, style: 'Sporty', occasion: ['Gym', 'Travel'], season: 'All Season', fit: 'Slim', tags: ['joggers', 'active'] }),
  makeProduct({ name: 'Men Canvas Baseball Cap', slug: 'men-canvas-baseball-cap', sku: 'MEN-ACC-001', gender: 'men', category: 'Caps', price: 599, image: 'photo-1521369909029-2afed882baee', sizes: ['One Size'], colors: ['Black'], stock: 25, style: 'Streetwear', occasion: ['Casual', 'Travel'], season: 'All Season', fit: 'Regular', tags: ['cap', 'accessory'] }),
  makeProduct({ name: 'Men Leather Card Wallet', slug: 'men-leather-card-wallet', sku: 'MEN-ACC-002', gender: 'men', category: 'Wallets', price: 899, image: 'photo-1627123424574-724758594e93', sizes: ['One Size'], colors: ['Brown'], stock: 20, style: 'Minimal', occasion: ['Office', 'Casual'], season: 'All Season', fit: 'Regular', tags: ['wallet', 'leather'] }),

  makeProduct({ name: 'Women Ribbed Crop Top', slug: 'women-ribbed-crop-top', sku: 'WOM-TOP-001', gender: 'women', category: 'Crop Tops', price: 899, image: 'photo-1564257577054-6e2fe9f9f1f1', sizes: ['XS', 'S', 'M', 'L'], colors: ['White'], stock: 15, style: 'Minimal', occasion: ['Casual', 'Date'], season: 'Summer', fit: 'Slim', tags: ['crop top', 'ribbed'] }),
  makeProduct({ name: 'Women Graphic Baby Tee', slug: 'women-graphic-baby-tee', sku: 'WOM-TEE-001', gender: 'women', category: 'Graphic T-Shirts', price: 999, image: 'photo-1551488831-00ddcb6c6bd3', sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Pink'], stock: 12, style: 'Streetwear', occasion: ['Casual', 'College'], season: 'Summer', fit: 'Slim', tags: ['graphic', 't-shirt'] }),
  makeProduct({ name: 'Women Linen Oversized Shirt', slug: 'women-linen-oversized-shirt', sku: 'WOM-SHR-001', gender: 'women', category: 'Shirts', price: 1699, image: 'photo-1598554747436-c9293d6a588f', sizes: ['S', 'M', 'L', 'XL'], colors: ['Cream'], stock: 10, style: 'Minimal', occasion: ['Office', 'Casual'], season: 'Summer', fit: 'Oversized', tags: ['shirt', 'linen'] }),
  makeProduct({ name: 'Women Cropped Hoodie', slug: 'women-cropped-hoodie', sku: 'WOM-HOD-001', gender: 'women', category: 'Hoodies', price: 1999, image: 'photo-1551488831-00ddcb6c6bd3', sizes: ['S', 'M', 'L'], colors: ['Lavender'], stock: 14, style: 'Streetwear', occasion: ['Casual', 'College'], season: 'Winter', fit: 'Oversized', tags: ['hoodie', 'cropped'] }),
  makeProduct({ name: 'Women Wide-Leg Jeans', slug: 'women-wide-leg-jeans', sku: 'WOM-JEA-001', gender: 'women', category: 'Wide-Leg Jeans', price: 2399, image: 'photo-1541099649105-f69ad21f3246', sizes: ['26', '28', '30', '32'], colors: ['Blue'], stock: 9, style: 'Casual', occasion: ['Casual', 'Travel'], season: 'All Season', fit: 'Relaxed', tags: ['jeans', 'denim'] }),
  makeProduct({ name: 'Women Utility Cargo Pants', slug: 'women-utility-cargo-pants', sku: 'WOM-CAR-001', gender: 'women', category: 'Cargo Pants', price: 1899, image: 'photo-1594633312681-425c7b97ccd1', sizes: ['S', 'M', 'L'], colors: ['Beige'], stock: 11, style: 'Streetwear', occasion: ['Casual', 'Travel'], season: 'All Season', fit: 'Relaxed', tags: ['cargo', 'utility'] }),
  makeProduct({ name: 'Women Pleated Tennis Skirt', slug: 'women-pleated-tennis-skirt', sku: 'WOM-SKT-001', gender: 'women', category: 'Skirts', price: 1299, image: 'photo-1583496661160-fb5886a13d27', sizes: ['XS', 'S', 'M', 'L'], colors: ['White'], stock: 8, style: 'Sporty', occasion: ['Casual', 'College'], season: 'Summer', fit: 'Regular', tags: ['skirt', 'pleated'] }),
  makeProduct({ name: 'Women Satin Slip Dress', slug: 'women-satin-slip-dress', sku: 'WOM-DRS-001', gender: 'women', category: 'Dresses', price: 2499, image: 'photo-1566174053879-31528523f8ae', sizes: ['XS', 'S', 'M', 'L'], colors: ['Black'], stock: 7, style: 'Minimal', occasion: ['Date', 'Party'], season: 'All Season', fit: 'Slim', tags: ['dress', 'satin'] }),
  makeProduct({ name: 'Women Relaxed Joggers', slug: 'women-relaxed-joggers', sku: 'WOM-JOG-001', gender: 'women', category: 'Joggers', price: 1499, image: 'photo-1506629905607-d9e2d9d9b8c1', sizes: ['XS', 'S', 'M', 'L'], colors: ['Grey'], stock: 13, style: 'Sporty', occasion: ['Gym', 'Travel'], season: 'All Season', fit: 'Relaxed', tags: ['joggers', 'lounge'] }),
  makeProduct({ name: 'Women Structured Tote Bag', slug: 'women-structured-tote-bag', sku: 'WOM-ACC-001', gender: 'women', category: 'Tote Bags', price: 1799, image: 'photo-1548036328-c9fa89d128fa', sizes: ['One Size'], colors: ['Tan'], stock: 18, style: 'Minimal', occasion: ['Office', 'Casual'], season: 'All Season', fit: 'Regular', tags: ['tote', 'bag'] }),
  makeProduct({ name: 'Women Round Frame Sunglasses', slug: 'women-round-frame-sunglasses', sku: 'WOM-ACC-002', gender: 'women', category: 'Sunglasses', price: 799, image: 'photo-1511499767150-a48a237f0083', sizes: ['One Size'], colors: ['Black'], stock: 22, style: 'Vintage', occasion: ['Casual', 'Travel'], season: 'Summer', fit: 'Regular', tags: ['sunglasses', 'accessory'] }),
];

const seedCategories = [...new Set(seedProducts.map((product) => product.category))].map((name) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}));

const legacyUnisexProducts = [
  { name: 'Oversized Hoodie', slug: 'unisex-oversized-hoodie', sku: 'UNI-HOD-001', image: 'photo-1556821840-3a63f95609a7' },
  { name: 'Cargo Pants', slug: 'unisex-cargo-pants', sku: 'UNI-CAR-001', image: 'photo-1517438476312-10d79c077509' },
  { name: 'Everyday Sweatshirt', slug: 'unisex-everyday-sweatshirt', sku: 'UNI-SWT-001', image: 'photo-1620799140408-edc6dcb6d633' },
  { name: 'sweatshirt', slug: 'unisex-classic-sweatshirt', sku: 'UNI-SWT-002', image: 'photo-1578681994506-b8f463449011', sizes: ['S', 'M', 'L', 'XL'] },
];

const seedDB = async () => {
  try {
    await connectDB();

    for (const category of seedCategories) {
      await Category.updateOne({ slug: category.slug }, { $set: category }, { upsert: true });
    }

    await Product.updateMany({ gender: { $exists: false } }, { $set: { gender: 'unisex' } });

    for (const product of legacyUnisexProducts) {
      await Product.updateOne(
        { name: product.name },
        {
          $set: {
            gender: 'unisex',
            slug: product.slug,
            sku: product.sku,
            description: `${product.name} designed for every wardrobe.`,
            images: buildGalleryImages('unisex', product.slug),
            sizes: product.sizes || ['S', 'M', 'L', 'XL'],
          },
        }
      );
    }

    for (const product of seedProducts) {
      await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true });
    }

    await StoreSettings.updateOne(
      {},
      { $setOnInsert: { storeName: 'Homies Wardrobe', currency: 'INR', shippingFee: 50, freeShippingMinimum: 999, taxRate: 18 } },
      { upsert: true }
    );

    console.log(`✅ Seeded ${seedProducts.length} products, ${seedCategories.length} categories`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();