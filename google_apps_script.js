/**
 * ============================================================================
 * SPARROWDEVLABS - GOOGLE APPS SCRIPT DATABASE & AUTOMATED EMAIL ENGINE (V9)
 * SENDER / REPLY-TO: sparrowdevlabs@gmail.com
 * ============================================================================
 */

function getSheet() {
  try {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.getActive();
    }
    if (ss) {
      return ss.getActiveSheet() || ss.getSheets()[0];
    }
  } catch (err) {
    Logger.log("getSheet Error: " + err.message);
  }
  return null;
}

function formatDateString(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(val).trim();
  if (str.includes('T')) return str.split('T')[0];
  return str;
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[d.getDay()];
    }
  } catch (e) {}
  return '';
}

/**
 * Sends HTML Subscription Confirmation & Receipt Email to Subscriber
 */
function sendSubscriptionConfirmationEmail(email, plan, startDate, expiryDate, paymentId, orderId) {
  if (!email || !email.includes('@')) return;
  
  const dayName = getDayOfWeek(startDate);
  const purchaseDisplay = startDate + (dayName ? ` (${dayName})` : '');
  
  let priceDisplay = '₹1 / month';
  if (plan.includes('PRO')) priceDisplay = plan.includes('YEARLY') ? '₹108 / year' : '₹10 / month';
  if (plan.includes('LEGEND')) priceDisplay = plan.includes('YEARLY') ? '₹315 / year' : '₹29 / month';
  if (plan.includes('BEGINNER')) priceDisplay = plan.includes('YEARLY') ? '₹11 / year' : '₹1 / month';

  const subject = "🎉 Welcome to SparrowDevLabs - Subscription Confirmed!";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #a78bfa; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">SPARROWDEVLABS</h2>
        <p style="color: #10b981; font-weight: bold; margin-top: 5px; font-size: 13px; letter-spacing: 1.5px;">✓ SUBSCRIPTION CONFIRMED & ACTIVE</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p style="font-size: 15px; color: #e2e8f0;">Hello,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Thank you for subscribing to <strong>SparrowDevLabs</strong>! Your subscription payment has been processed successfully. Below are your complete plan & receipt details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Subscriber Email:</td><td style="padding: 12px; color: #ffffff; font-weight: bold; font-size: 13px; text-align: right;">${email}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Membership Plan:</td><td style="padding: 12px; color: #38bdf8; font-weight: bold; font-size: 13px; text-align: right;">${plan}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Price Paid:</td><td style="padding: 12px; color: #ffffff; font-weight: bold; font-size: 13px; text-align: right;">${priceDisplay}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Date & Day Bought:</td><td style="padding: 12px; color: #ffffff; font-size: 13px; text-align: right;">${purchaseDisplay}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Expiry Date:</td><td style="padding: 12px; color: #ffffff; font-size: 13px; text-align: right;">${expiryDate}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Payment ID:</td><td style="padding: 12px; color: #a78bfa; font-family: monospace; font-size: 12px; text-align: right;">${paymentId}</td></tr>
          <tr><td style="padding: 12px; color: #94a3b8; font-size: 13px;">Order ID / Receipt:</td><td style="padding: 12px; color: #a78bfa; font-family: monospace; font-size: 12px; text-align: right;">${orderId}</td></tr>
        </table>
        
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">Need assistance? Reply directly to this email or visit our portal at <a href="https://sparrow-dev-labs.vercel.app" style="color: #a78bfa; text-decoration: underline;">sparrow-dev-labs.vercel.app</a>.</p>
      </div>
      
      <div style="text-align: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #64748b;">
        © SparrowDevLabs. All rights reserved. • sparrowdevlabs@gmail.com
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: "SparrowDevLabs",
      replyTo: "sparrowdevlabs@gmail.com"
    });
    Logger.log("Confirmation email sent to: " + email);
  } catch (err) {
    Logger.log("sendSubscriptionConfirmationEmail Error: " + err.toString());
  }
}

/**
 * Sends HTML Expiration Notification & Renewal Email to Subscriber
 */
function sendSubscriptionExpiredEmail(email, plan, expiryDate) {
  if (!email || !email.includes('@')) return;

  const subject = "⚠️ Your SparrowDevLabs Subscription Has Expired";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #ef4444; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">SPARROWDEVLABS</h2>
        <p style="color: #f59e0b; font-weight: bold; margin-top: 5px; font-size: 13px; letter-spacing: 1.5px;">⚠️ SUBSCRIPTION EXPIRED</p>
      </div>
      
      <div style="padding: 20px 0;">
        <p style="font-size: 15px; color: #e2e8f0;">Hello,</p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Your <strong>SparrowDevLabs ${plan}</strong> membership reached its expiry date on <strong>${expiryDate}</strong> and is now marked as <strong>INACTIVE</strong>.</p>
        
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #fca5a5; font-size: 13px; line-height: 1.5;">To reactivate your membership features and retain your perks, please click below to renew your plan.</p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="https://sparrow-dev-labs.vercel.app/#pricing" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);">RENEW YOUR SUBSCRIPTION NOW →</a>
        </div>
      </div>
      
      <div style="text-align: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #64748b;">
        © SparrowDevLabs. All rights reserved. • sparrowdevlabs@gmail.com
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody,
      name: "SparrowDevLabs",
      replyTo: "sparrowdevlabs@gmail.com"
    });
    Logger.log("Expiration notice email sent to: " + email);
  } catch (err) {
    Logger.log("sendSubscriptionExpiredEmail Error: " + err.toString());
  }
}

function saveSubscriptionData(data) {
  const sheet = getSheet();
  if (!sheet) {
    Logger.log("ERROR: Could not get active sheet");
    return false;
  }

  // Create Styled Header Row automatically if sheet is blank
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Email", 
      "Plan", 
      "Purchase Date", 
      "Expiry Date", 
      "Payment ID", 
      "Order ID / UTR", 
      "Status"
    ]);
    const headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#7c3aed");
    headerRange.setFontColor("#ffffff");
  }
  
  data = data || {};
  const email = (data.email || data.Email || '').toString().toLowerCase().trim();
  const plan = (data.plan || data.Plan || 'BEGINNER (MONTHLY)').toString().toUpperCase();
  const startDate = data.startDate || new Date().toISOString().split('T')[0];
  const expiryDate = data.expiryDate || '';
  const paymentId = data.paymentId || data.razorpay_payment_id || 'N/A';
  const orderId = data.orderId || data.razorpay_order_id || data.utr || 'N/A';
  const status = 'ACTIVE';

  if (!email) return false;

  const rows = sheet.getDataRange().getValues();
  let existingRowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    const rowEmail = (rows[i][0] || '').toString().toLowerCase().trim();
    if (rowEmail === email) {
      existingRowIndex = i + 1; // 1-based row index
      break;
    }
  }

  if (existingRowIndex > 0) {
    // Update existing subscriber row in-place
    sheet.getRange(existingRowIndex, 2).setValue(plan);
    sheet.getRange(existingRowIndex, 3).setValue(startDate);
    sheet.getRange(existingRowIndex, 4).setValue(expiryDate);
    sheet.getRange(existingRowIndex, 5).setValue(paymentId);
    sheet.getRange(existingRowIndex, 6).setValue(orderId);
    sheet.getRange(existingRowIndex, 7).setValue(status);
  } else {
    // Append new subscriber row
    sheet.appendRow([email, plan, startDate, expiryDate, paymentId, orderId, status]);
  }

  SpreadsheetApp.flush();

  // Send HTML Subscription Confirmation & Receipt Email!
  sendSubscriptionConfirmationEmail(email, plan, startDate, expiryDate, paymentId, orderId);

  return true;
}

function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    saveSubscriptionData(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Subscription recorded/updated & confirmation email sent successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || '';
    const email = (params.email || '').toLowerCase().trim();

    if (action === 'add_subscription') {
      saveSubscriptionData(params);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Subscription recorded/updated & confirmation email sent via GET"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = getSheet();
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "No sheet found" })).setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();
    
    if (action === 'check_membership' || action === 'check_active_subscription') {
      const today = new Date().toISOString().split('T')[0];
      let activeSub = null;
      
      for (let i = 1; i < rows.length; i++) {
        const rowEmail = (rows[i][0] || '').toString().toLowerCase().trim();
        const rowPlan = (rows[i][1] || 'FREE USER').toString().trim();
        const rowStartDate = formatDateString(rows[i][2]) || today;
        const rowExpiry = formatDateString(rows[i][3]);
        const rowPaymentId = (rows[i][4] || 'N/A').toString();
        const rowOrderId = (rows[i][5] || 'N/A').toString();
        const rowStatus = (rows[i][6] || 'ACTIVE').toString().toUpperCase().trim();
        
        if (rowEmail === email && rowStatus === 'ACTIVE') {
          if (!rowExpiry || rowExpiry >= today) {
            let planPrice = '₹1 / month';
            if (rowPlan.includes('PRO')) planPrice = rowPlan.includes('YEARLY') ? '₹108 / year' : '₹10 / month';
            if (rowPlan.includes('LEGEND')) planPrice = rowPlan.includes('YEARLY') ? '₹315 / year' : '₹29 / month';
            if (rowPlan.includes('BEGINNER')) planPrice = rowPlan.includes('YEARLY') ? '₹11 / year' : '₹1 / month';

            activeSub = {
              email: rowEmail,
              plan: rowPlan.toUpperCase(),
              price: planPrice,
              startDate: rowStartDate,
              dayBought: getDayOfWeek(rowStartDate),
              expiryDate: rowExpiry,
              paymentId: rowPaymentId,
              orderId: rowOrderId,
              status: 'ACTIVE'
            };
            break;
          }
        }
      }
      
      if (activeSub) {
        return ContentService.createTextOutput(JSON.stringify({
          active: true,
          email: email,
          plan: activeSub.plan,
          subscription: activeSub
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          active: false,
          email: email,
          plan: 'FREE USER'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "SparrowDevLabs Database V9 Active"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * DAILY CRON JOB: Automatically sets Status = 'INACTIVE' when expiry date is reached and sends Expiration Email!
 */
function checkAndSetInactive() {
  const sheet = getSheet();
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 1; i < rows.length; i++) {
    const rowEmail = (rows[i][0] || '').toString().toLowerCase().trim();
    const rowPlan = (rows[i][1] || 'SUBSCRIPTION').toString();
    const rowExpiry = formatDateString(rows[i][3]);
    const currentStatus = (rows[i][6] || '').toString().toUpperCase().trim();
    
    if (rowExpiry && rowExpiry < today && currentStatus === 'ACTIVE') {
      sheet.getRange(i + 1, 7).setValue('INACTIVE');
      Logger.log("Marked subscription INACTIVE for: " + rowEmail);
      
      // Send Expiration Notice & Renewal Email
      sendSubscriptionExpiredEmail(rowEmail, rowPlan, rowExpiry);
    }
  }
}
