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
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required contact fields (name, email, message)' });
    }

    let membershipTier = 'FREE USER';

    // Query Google Apps Script Webhook to check if this email has an active subscription
    const googleSheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';
    if (googleSheetWebhook) {
      try {
        const checkRes = await fetch(`${googleSheetWebhook}?action=check_membership&email=${encodeURIComponent(email)}`);
        const checkData = await checkRes.json();
        if (checkData && checkData.plan) {
          membershipTier = checkData.plan.toUpperCase();
        }
      } catch (err) {
        console.warn('Membership lookup warning:', err.message);
      }
    }

    // Send Telegram Notification to owners
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      const tgMsg = `📩 *NEW WEBSITE MESSAGE*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n🎖️ *Membership:* \`[${membershipTier}]\`\n\n💬 *Message:*\n${message}`;

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: tgMsg,
          parse_mode: 'Markdown'
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
