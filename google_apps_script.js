/**
 * ============================================================================
 * SPARROWDEVLABS - GOOGLE APPS SCRIPT DATABASE & AUTOMATION (V2)
 * ============================================================================
 * Features:
 * 1. Automatically creates Headers: Email, Plan, Purchase Date, Expiry Date, Payment ID, Order ID / UTR, Status
 * 2. Parses both Server & Frontend payloads reliably.
 * 3. Daily cron checkAndRemoveExpired() automatically removes expired rows.
 */

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

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Create Header Row if sheet is blank
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
      // Format header style
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#7c3aed");
      headerRange.setFontColor("#ffffff");
    }
    
    const email = data.email || '';
    const plan = data.plan || '';
    const startDate = data.startDate || new Date().toISOString().split('T')[0];
    const expiryDate = data.expiryDate || '';
    const paymentId = data.paymentId || data.razorpay_payment_id || 'N/A';
    const orderId = data.orderId || data.razorpay_order_id || data.utr || 'N/A';
    const status = data.status || 'ACTIVE';
    
    if (email) {
      sheet.appendRow([email, plan, startDate, expiryDate, paymentId, orderId, status]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Subscription recorded successfully in Google Sheet"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e ? e.parameter.action : '';
    const email = e ? (e.parameter.email || '').toLowerCase().trim() : '';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    
    if (action === 'check_membership') {
      const today = new Date().toISOString().split('T')[0];
      let activePlan = 'NONE';
      
      for (let i = 1; i < rows.length; i++) {
        const rowEmail = (rows[i][0] || '').toString().toLowerCase().trim();
        const rowPlan = rows[i][1];
        const rowExpiry = rows[i][3];
        const rowStatus = rows[i][6] || rows[i][5];
        
        if (rowEmail === email && (rowStatus === 'ACTIVE' || !rowStatus)) {
          if (!rowExpiry || rowExpiry >= today) {
            activePlan = rowPlan;
            break;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        email: email,
        plan: activePlan
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "SparrowDevLabs Database Active"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * DAILY CRON JOB: Automatically checks and deletes expired subscription rows!
 */
function checkAndRemoveExpired() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = rows.length - 1; i >= 1; i--) {
    const rowExpiry = rows[i][3];
    if (rowExpiry && rowExpiry < today) {
      sheet.deleteRow(i + 1);
      Logger.log("Deleted expired row for: " + rows[i][0]);
    }
  }
}
