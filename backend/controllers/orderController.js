const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');

const orderError = (message, status = 400) => Object.assign(new Error(message), { status });

const createOrder = async (req, res) => {
  let session;
  try {
    const { items, shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      throw orderError('No items in order');
    }
    const paymentMethods = {
      'Cash on Delivery': 'Cash on Delivery',
      'Credit / Debit Card': 'Credit / Debit Card (Demo)',
      UPI: 'UPI (Demo)',
    };
    if (!Object.hasOwn(paymentMethods, paymentMethod)) {
      throw orderError('Unsupported payment method');
    }
    const requiredAddress = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];
    if (!shippingAddress || requiredAddress.some((field) =>
      typeof shippingAddress[field] !== 'string' || !shippingAddress[field].trim())) {
      throw orderError('Please fill in all required shipping fields');
    }

    // Aggregate quantities across sizes/colors so duplicate lines cannot oversell.
    const requestedStock = new Map();
    const requestedItems = items.map((item) => {
      const id = item?.product || item?.id || item?._id;
      if (typeof id !== 'string' || !mongoose.isObjectIdOrHexString(id)) {
        throw orderError('Invalid product ID');
      }
      const quantity = item.quantity;
      if (!Number.isSafeInteger(quantity) || quantity < 1) {
        throw orderError('Quantity must be a positive integer');
      }
      const productId = id.toLowerCase();
      const total = (requestedStock.get(productId) || 0) + quantity;
      if (!Number.isSafeInteger(total)) throw orderError('Invalid total quantity');
      requestedStock.set(productId, total);
      return { ...item, productId, quantity };
    });

    session = await mongoose.startSession();
    // withTransaction aborts on failure and retries transient write conflicts.
    const order = await session.withTransaction(async () => {
      const settings = await StoreSettings.findOne().session(session);
      const products = await Product.find({ _id: { $in: [...requestedStock.keys()] } }).session(session);
      const productMap = new Map(products.map((product) => [product._id.toString(), product]));

      // Validate the entire cart before any inventory writes.
      for (const [id, quantity] of requestedStock) {
        const product = productMap.get(id);
        if (!product) throw orderError('Product not found', 404);
        if (product.stock < quantity) {
          throw orderError('Insufficient stock for "' + product.name + '"', 409);
        }
      }
      let subtotal = 0;
      const validatedItems = requestedItems.map((item) => {
        const product = productMap.get(item.productId);
        const price = Number(product.price - (product.discountPrice || 0));
        if (!Number.isFinite(price) || price < 0) throw orderError('Invalid product price');
        subtotal += price * item.quantity;
        return {
          product: product._id,
          name: product.name,
          price,
          quantity: item.quantity,
          size: item.selectedSize || item.size || '',
          color: item.selectedColor || item.color || '',
          image: product.images[0] || '',
        };
      });
      subtotal = Number(subtotal.toFixed(2));
      const shippingFee = subtotal >= (settings?.freeShippingMinimum ?? 999)
        ? 0 : Number(settings?.shippingFee ?? 50);
      const tax = Number((subtotal * (settings?.taxRate ?? 18) / 100).toFixed(2));
      const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));
      if (![subtotal, shippingFee, tax, totalAmount].every((value) => Number.isFinite(value) && value >= 0)) {
        throw orderError('Invalid order totals');
      }

      for (const [id, quantity] of requestedStock) {
        const result = await Product.updateOne(
          { _id: id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { session }
        );
        if (result.modifiedCount !== 1) throw orderError('Insufficient stock', 409);
      }
      const [createdOrder] = await Order.create([{
        user: req.user._id,
        items: validatedItems,
        subtotal,
        shippingFee,
        tax,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethods[paymentMethod],
        // No gateway exists: neither COD nor simulated online payments are verified.
        paymentStatus: 'pending',
        orderStatus: 'Processing',
      }], { session });
      return createdOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
    res.status(status).json({
      success: false,
      message: status < 500 ? error.message : 'Unable to create order. Please try again.',
    });
  } finally {
    if (session) await session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
