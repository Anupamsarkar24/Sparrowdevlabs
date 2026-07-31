const crypto = require('crypto');

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan = 'PRO', email, isYearly } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'q42Ct46fa0Lrs2G64Mv5MKZy';

    // Verify HMAC SHA256 Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Payment NOT verified.'
      });
    }

    // Payment Signature Verified! Calculate dates
    const now = new Date();
    const startDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const expiry = new Date(now);
    const daysToAdd = isYearly ? 365 : 30; // 365 days for annual, 30 days for monthly
    expiry.setDate(expiry.getDate() + daysToAdd);
    const expiryDate = expiry.toISOString().split('T')[0];

    const planLabel = `${plan.toUpperCase()}${isYearly ? ' (YEARLY)' : ' (MONTHLY)'}`;

    const payload = {
      email: email || 'subscriber@example.com',
      plan: planLabel,
      startDate: startDate,
      expiryDate: expiryDate,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'ACTIVE'
    };

    // Forward to Google Apps Script Webhook
    const googleSheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';
    if (googleSheetWebhook) {
      try {
        await fetch(googleSheetWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_subscription', ...payload })
        });
      } catch (err) {
        console.warn('Failed to send to Google Sheet Webhook:', err.message);
      }
    }

    // Send Telegram Notification to owners (if token & chat_id configured)
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramToken && telegramChatId) {
      try {
        const tgMsg = `🎉 *NEW MEMBERSHIP PURCHASE!*\n\n📧 *Email:* ${payload.email}\n⭐ *Plan:* ${payload.plan}\n📅 *Purchased:* ${startDate}\n⏳ *Expiry:* ${expiryDate}\n💳 *Payment ID:* \`${payload.paymentId}\``;
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: tgMsg,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.warn('Failed to send Telegram alert:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and membership activated!',
      subscription: payload
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      error: 'Internal server error during payment verification',
      details: error.message || error
    });
  }
};
