/**
 * Google Apps Script for FMS Application - Login, Upload & Data Sync Support
 */

const DEFAULT_SHEET = 'Pi Master';
const HEADING_ROW = 1;
const START_ROW = 2; 

function clean(str) {
  return String(str || '').replace(/[^\x20-\x7E]/g, '').trim().toLowerCase();
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'read_all') {
      const sheets = ["Pi Master", "FMS", "Master", "Vendor Payment", "Partner Pay"];
      const allData = {};
      sheets.forEach(name => {
        const sh = ss.getSheetByName(name);
        if (sh) {
          const lastRow = sh.getLastRow();
          const startFrom = (name === "Login") ? 2 : HEADING_ROW;
          if (lastRow >= startFrom) {
            allData[name] = sh.getRange(startFrom, 1, lastRow - startFrom + 1, 30).getValues();
          } else {
            allData[name] = [];
          }
        }
      });
      return ContentService.createTextOutput(JSON.stringify(allData)).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const data = body.data;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // --- Action: Login ---
    if (action === 'login') {
      const sheet = ss.getSheetByName("Login");
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ error: "Login sheet not found" })).setMimeType(ContentService.MimeType.JSON);
      
      const values = sheet.getDataRange().getValues();
      const username = data.username;
      const password = data.password;

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[0]) === username && String(row[1]) === password) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            user: {
              username: row[0],
              permissions: {
                overview: row[2] === "Yes",
                'client-dashboard': row[3] === "Yes",
                'client-insights': row[4] === "Yes",
                'partner-ledger': row[5] === "Yes",
                'vendor-ledger': row[6] === "Yes",
                'pi-received': row[7] === "Yes",
                // Additional internal steps (Enable for admin, or keep enabled if they have primary access)
                'pi-approval': row[0] === 'admin' || row[7] === "Yes",
                'payment-received': row[0] === 'admin' || row[7] === "Yes",
                'partner-payout': row[0] === 'admin' || row[5] === "Yes",
                'vendor-payment': row[0] === 'admin' || row[6] === "Yes",
                history: row[0] === 'admin' || row[5] === "Yes" || row[6] === "Yes"
              }
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: "Invalid credentials" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Upload File ---
    if (action === 'upload_file') {
      try {
        const folderId = "1gOs-L9Q7vY2XCeXXb1qxUPXoNkyomQq-";
        let folder;
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch (fErr) {
          // Fallback to name search if ID fails
          const folders = DriveApp.getFoldersByName("FMS_Uploads");
          if (folders.hasNext()) folder = folders.next();
          else folder = DriveApp.createFolder("FMS_Uploads");
        }
        
        const contentType = data.mimeType || 'application/octet-stream';
        const bytes = Utilities.base64Decode(data.base64);
        const fileName = data.fileName || ("PI_Copy_" + new Date().getTime());
        const blob = Utilities.newBlob(bytes, contentType, fileName);
        
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'success', 
          url: file.getUrl(),
          id: file.getId()
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'error', 
          message: "Drive Error: " + err.toString() 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // --- Action: Save Master ---
    if (action === 'save-master') {
      const sheet = ss.getSheetByName("Master");
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Master sheet not found' })).setMimeType(ContentService.MimeType.JSON);
      
      const parties = data.parties || [];
      const items = data.items || [];
      const maxRows = Math.max(parties.length, items.length);
      
      if (maxRows > 0) {
        sheet.getRange(2, 1, sheet.getLastRow() || 1, 2).clearContent();
        const values = [];
        for (let i = 0; i < maxRows; i++) {
          values.push([parties[i] || '', items[i] || '']);
        }
        sheet.getRange(2, 1, values.length, 2).setValues(values);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Vendor & Partner Payments (Append Only) ---
    if (action === 'vendor-payment' || action === 'partner-payout') {
      const records = Array.isArray(data) ? data : [data];
      const sheetName = records[0].sheetName || (action === 'vendor-payment' ? 'Vendor Payment' : 'Partner Pay');
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Sheet not found: ' + sheetName })).setMimeType(ContentService.MimeType.JSON);
      
      records.forEach(record => {
        const values = action === 'vendor-payment' ? [
          record.piNo || '',
          record.vendorName || '',
          record.vendorAmount || 0,
          record.chinaCurrency || 0,
          record.actualAmount || 0,
          record.note || '',
          new Date()
        ] : [
          record.piNo || '',
          new Date().toLocaleDateString(),
          record.partyName || '',
          record.amount || 0,
          record.note || ''
        ];
        sheet.appendRow(values);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- Action: Write (Sync Data) ---
    if (action === 'write') {
      const records = Array.isArray(data) ? data : [data];
      
      records.forEach(record => {
        const sheetName = record.sheetName || data.sheetName || DEFAULT_SHEET;
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          if (sheetName === 'Pi Master') sheet = ss.getSheetByName('PI Receipt');
          else if (sheetName === 'PI Receipt') sheet = ss.getSheetByName('Pi Master');
        }
        if (!sheet) return;

        const piNo = record.piNo;
        const lastRow = sheet.getLastRow();
        const headings = sheet.getRange(HEADING_ROW, 1, 1, 40).getValues()[0];
        const headingMap = {};
        headings.forEach((h, i) => { if (h) headingMap[clean(h)] = i + 1; });

        const keyMap = {
          'timestamp': clean('Timestamp'),
          'piNo': clean('Pi No.'),
          'partyName': clean('Client Name'),
          'piAmount': [clean('Total Sales Amount'), clean('Total Pi Amount')],
          'totalPurchaseAmount': clean('Total Purchase Amount'),
          'collectedAmount': clean('Collected Amount'), 
          's3_actual': clean('Actual1'),
          'amount': clean('Amount'), 
          's4_actual': clean('Actual2'),
          'vendorName': clean('Vendor Name'), 
          'vendorAmount': [clean('Amount'), clean('Vendor Amount')], 
          'chinaCurrency': clean('China Currency'),
          'actualAmount': clean('Actual Amount'),
          's5_actual': clean('Actual3'),
          'remark': clean('Remark'), 
          'approval': clean('Approval'), 
          'note': clean('Note'),
          'piCopy': clean('PI Copy'),
          'pay1': clean('Pay1'), 'pay2': clean('Pay2'), 'pay3': clean('Pay3'), 'pay4': clean('Pay4'), 'pay5': clean('Pay5'),
          'pay6': clean('Pay6'), 'pay7': clean('Pay7'), 'pay8': clean('Pay8'), 'pay9': clean('Pay9'), 'pay10': clean('Pay10'),
          'vendorPay1': clean('Pay1'), 'vendorPay2': clean('Pay2'), 'vendorPay3': clean('Pay3'), 'vendorPay4': clean('Pay4'), 'vendorPay5': clean('Pay5'),
          'vendorPay6': clean('Pay6'), 'vendorPay7': clean('Pay7'), 'vendorPay8': clean('Pay8'), 'vendorPay9': clean('Pay9'), 'vendorPay10': clean('Pay10')
        };

        const piColIndex = headingMap[keyMap.piNo];
        if (!piColIndex) return;

        let targetRow = lastRow + 1;
        let isUpdate = false;
        const searchPi = clean(piNo);
        
        // Append logic for payment tracking sheets, Update logic for master PI sheet
        const isMasterSheet = (sheetName === 'Pi Master' || sheetName === 'PI Receipt');

        if (isMasterSheet && lastRow >= START_ROW) {
          const piNos = sheet.getRange(START_ROW, piColIndex, lastRow - START_ROW + 1, 1).getValues();
          for (let i = piNos.length - 1; i >= 0; i--) {
            if (clean(piNos[i][0]) === searchPi && searchPi !== "") {
              targetRow = START_ROW + i;
              isUpdate = true;
              break;
            }
          }
        }

        let rowFormulas = (targetRow <= sheet.getMaxRows() && targetRow >= 1) ? sheet.getRange(targetRow, 1, 1, 40).getFormulas()[0] : [];
        for (const [apiKey, sheetKey] of Object.entries(keyMap)) {
          const possibleKeys = Array.isArray(sheetKey) ? sheetKey : [sheetKey];
          let colIndex = null;
          for (const k of possibleKeys) {
            if (headingMap[k]) { colIndex = headingMap[k]; break; }
          }
          
          if (colIndex && record[apiKey] !== undefined) {
            if (isUpdate && apiKey === 'timestamp') continue;
            if (rowFormulas[colIndex - 1] && rowFormulas[colIndex - 1] !== "") continue;
            sheet.getRange(targetRow, colIndex).setValue(record[apiKey]);
          }
        }
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * IMPORTANT: RUN THIS FUNCTION MANUALLY IN THE APPS SCRIPT EDITOR 
 * TO AUTHORIZE DRIVE ACCESS.
 */
function triggerAuthorization() {
  const folderId = "1gOs-L9Q7vY2XCeXXb1qxUPXoNkyomQq-";
  try {
    const folder = DriveApp.getFolderById(folderId);
    Logger.log("Successfully accessed folder: " + folder.getName());
    const blob = Utilities.newBlob("test", "text/plain", "test.txt");
    const file = folder.createFile(blob);
    Logger.log("Successfully created test file: " + file.getUrl());
    DriveApp.removeFile(file);
    Logger.log("Cleaned up test file.");
  } catch (e) {
    Logger.log("Error: " + e.toString());
    throw e;
  }
}
