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
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    body = body || {};

    const { name, email, category, service, message } = body;
    const userCategory = category || service || 'General Inquiry';

    if (!email || !message) {
      return res.status(400).json({ error: 'Missing required fields (email, message)' });
    }

    let membershipTier = 'FREE USER';

    // Query Google Apps Script Webhook to check if this email has an active subscription
    const googleSheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';
    if (googleSheetWebhook) {
      try {
        const checkRes = await fetch(`${googleSheetWebhook}?action=check_membership&email=${encodeURIComponent(email)}`);
        const checkData = await checkRes.json();
        if (checkData && checkData.plan && checkData.plan !== 'NONE') {
          membershipTier = checkData.plan.toUpperCase();
        }
      } catch (err) {
        console.warn('Membership lookup warning:', err.message);
      }
    }

    // Send Telegram Notification to owners
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '8673149889:AAH6Md9MPqmz6UigMpcRuVxb480vDKgZ9kI';
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || '7833318325';

    if (telegramToken && telegramChatId) {
      const tgMsg = `<b>📬 NEW CONTACT MESSAGE</b>\n\n${name ? `<b>👤 Name:</b> ${name}\n` : ''}<b>📧 Email:</b> ${email}\n<b>⭐ Membership:</b> <code>[${membershipTier}]</code>\n<b>📌 Category:</b> ${userCategory}\n\n<b>💬 Message:</b>\n<i>${message}</i>`;

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: tgMsg,
          parse_mode: 'HTML'
        })
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      membership: membershipTier
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).json({
      error: 'Failed to process message',
      details: error.message || error
    });
  }
};
