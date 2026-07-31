const Razorpay = require('razorpay');

module.exports = async function handler(req, res) {
  // CORS & Method Check
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Robust body parsing (handles stringified JSON on Vercel)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = body;

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TK6UJsQdNoMty1';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'nuDuDjliQKO2rheq4J0UOUV4';

    if (!key_id || !key_secret) {
      return res.status(401).json({ error: 'Razorpay API credentials missing' });
    }

    // Minimum amount check: 100 paise (₹1)
    const amountPaise = Math.round(Number(amount));
    if (!amountPaise || isNaN(amountPaise) || amountPaise < 100) {
      return res.status(400).json({ error: `Invalid amount: ${amount}. Amount must be at least 100 paise (₹1)` });
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const orderOptions = {
      amount: amountPaise,
      currency: currency,
      receipt: String(receipt).slice(0, 40)
    };

    const order = await instance.orders.create(orderOptions);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    const errorDetails = error.error ? (error.error.description || JSON.stringify(error.error)) : (error.message || error.toString());
    return res.status(500).json({
      error: 'Failed to create order with Razorpay',
      details: errorDetails
    });
  }
};
