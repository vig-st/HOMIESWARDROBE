const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5000' });

async function run() {
  try {
    console.log('GET /api/products — expecting empty array or list');
    let res = await api.get('/api/products');
    console.log('STATUS', res.status);
    console.log('DATA', res.data);

    console.log('\nPOST /api/products — creating sample product');
    const payload = {
      name: 'Oversized Black Hoodie',
      description: 'Premium streetwear hoodie',
      price: 1999,
      discountPrice: 1499,
      category: 'Hoodies',
      productCollection: 'Winter Collection',
      brand: 'HOMIESWARDROBE',
      sizes: ['M','L','XL'],
      colors: ['Black'],
      stock: 20,
      images: ['hoodie.jpg'],
      featured: true,
      bestSeller: false,
      newArrival: true
    };

    res = await api.post('/api/products', payload, { headers: { 'Content-Type': 'application/json' } });
    console.log('POST STATUS', res.status);
    console.log('POST DATA', res.data);

    const created = res.data && res.data.data ? res.data.data : null;
    if (!created || !created._id) {
      console.error('Product creation failed or returned unexpected response');
      process.exit(1);
    }

    const id = created._id;

    console.log(`\nGET /api/products/${id}`);
    res = await api.get(`/api/products/${id}`);
    console.log('GET BY ID STATUS', res.status);
    console.log('GET BY ID DATA', res.data);

    console.log(`\nPUT /api/products/${id} — update stock to 15`);
    res = await api.put(`/api/products/${id}`, { stock: 15 });
    console.log('PUT STATUS', res.status);
    console.log('PUT DATA', res.data);

    console.log(`\nDELETE /api/products/${id}`);
    res = await api.delete(`/api/products/${id}`);
    console.log('DELETE STATUS', res.status);
    console.log('DELETE DATA', res.data);

    console.log('\nFinal GET /api/products');
    res = await api.get('/api/products');
    console.log('FINAL STATUS', res.status);
    console.log('FINAL DATA', res.data);

    console.log('\nCRUD test completed successfully');
  } catch (err) {
    if (err.response) {
      console.error('ERROR RESPONSE:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
    process.exit(1);
  }
}

run();
