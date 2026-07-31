/**
 * ============================================================================
 * SPARROWDEVLABS - GOOGLE APPS SCRIPT DATABASE & AUTOMATION
 * ============================================================================
 * Paste this code into: Google Sheets -> Extensions -> Apps Script
 * Then Deploy -> New deployment -> Web app -> Anyone has access -> Deploy!
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Email", "Plan", "Purchase Date", "Expiry Date", "Payment ID", "Status"]);
    }
    
    if (data.action === 'add_subscription') {
      const email = data.email || '';
      const plan = data.plan || '';
      const startDate = data.startDate || new Date().toISOString().split('T')[0];
      const expiryDate = data.expiryDate || '';
      const paymentId = data.paymentId || '';
      const status = 'ACTIVE';
      
      sheet.appendRow([email, plan, startDate, expiryDate, paymentId, status]);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Subscription added successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const email = (e.parameter.email || '').toLowerCase().trim();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();
    
    if (action === 'check_membership') {
      const today = new Date().toISOString().split('T')[0];
      let activePlan = 'NONE';
      
      // Iterate through rows (skip header)
      for (let i = 1; i < rows.length; i++) {
        const rowEmail = (rows[i][0] || '').toString().toLowerCase().trim();
        const rowPlan = rows[i][1];
        const rowExpiry = rows[i][3];
        const rowStatus = rows[i][5];
        
        if (rowEmail === email && (rowStatus === 'ACTIVE' || !rowStatus)) {
          // Compare expiry date
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
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * DAILY CRON JOB: Automatically checks and deletes/archives expired rows!
 * Setup: In Apps Script Editor -> Triggers (clock icon) -> Add Trigger 
 * -> Run: checkAndRemoveExpired -> Time-driven -> Day timer (Every 24h)
 */
function checkAndRemoveExpired() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const today = new Date().toISOString().split('T')[0];
  
  // Iterate backwards when deleting rows
  for (let i = rows.length - 1; i >= 1; i--) {
    const rowExpiry = rows[i][3];
    if (rowExpiry && rowExpiry < today) {
      sheet.deleteRow(i + 1); // Auto-delete expired subscription row!
      Logger.log("Deleted expired row for: " + rows[i][0]);
    }
  }
}
