/**
 * ============================================================================
 * SPARROWDEVLABS - GOOGLE APPS SCRIPT DATABASE (V8 COMPLETE ACTIVE CHECK & INACTIVE STATUS)
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
      message: "Subscription recorded/updated successfully in Google Sheet"
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
        message: "Subscription recorded/updated successfully via GET"
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
            // Price lookup helper
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
      status: "SparrowDevLabs Database V8 Active"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * DAILY CRON JOB: Automatically sets Status = 'INACTIVE' when expiry date is reached!
 * (Does NOT delete rows!)
 */
function checkAndSetInactive() {
  const sheet = getSheet();
  if (!sheet) return;
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 1; i < rows.length; i++) {
    const rowExpiry = formatDateString(rows[i][3]);
    const currentStatus = (rows[i][6] || '').toString().toUpperCase().trim();
    
    if (rowExpiry && rowExpiry < today && currentStatus === 'ACTIVE') {
      sheet.getRange(i + 1, 7).setValue('INACTIVE');
      Logger.log("Marked subscription INACTIVE for: " + rows[i][0]);
    }
  }
}
