/**
 * Google Apps Script for FMS Application - Login & Permissions Support
 */

const DEFAULT_SHEET = "Pi Master";
const HEADING_ROW = 6;
const START_ROW = 7; 

function clean(str) {
  return String(str || '').replace(/[^\x20-\x7E]/g, '').trim().toLowerCase();
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'read_all') {
      const sheets = ["Pi Master", "FMS", "Master"];
      const allData = {};
      sheets.forEach(name => {
        const sh = ss.getSheetByName(name);
        if (sh) {
          const lastRow = sh.getLastRow();
          const startFrom = (name === "Master" || name === "Login") ? 2 : START_ROW;
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
          // Found user, return permissions
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            user: {
              username: row[0],
              permissions: {
                overview: row[2] === "Yes",
                history: row[3] === "Yes",
                'pi-received': row[4] === "Yes",
                'pi-approval': row[5] === "Yes",
                'payment-received': row[6] === "Yes",
                'partner-payout': row[7] === "Yes",
                'vendor-payment': row[8] === "Yes"
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
        const folderId = "1eqeQGknWmX6PdoNq_dFyLYbxFy_K4Hkq";
        let folder;
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch (fErr) {
          return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: "Folder not found or No access: " + folderId })).setMimeType(ContentService.MimeType.JSON);
        }
        
        const contentType = data.mimeType || 'application/pdf';
        const bytes = Utilities.base64Decode(data.base64);
        const fileName = data.fileName || ("PI_Copy_" + new Date().getTime());
        const blob = Utilities.newBlob(bytes, contentType, fileName);
        
        const file = folder.createFile(blob);
        try {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (sErr) {
          console.warn("Could not set public sharing: " + sErr.toString());
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'success', 
          url: file.getUrl(),
          id: file.getId()
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: 'error', 
          message: err.toString() 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // --- Action: Write ---
    if (action === 'write') {
      const records = Array.isArray(data) ? data : [data];
      
      records.forEach(record => {
        const sheetName = record.sheetName || data.sheetName || DEFAULT_SHEET;
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) return;

        const piNo = record.piNo;
        const lastRow = sheet.getLastRow();
        const headings = sheet.getRange(HEADING_ROW, 1, 1, 40).getValues()[0];
        const headingMap = {};
        headings.forEach((h, i) => { if (h) headingMap[clean(h)] = i + 1; });

        const keyMap = {
          'timestamp': clean('Timestamp'), 'piNo': clean('Pi No.'), 'partyName': clean('Party Name'), 'piAmount': clean('Pi Amount'),
          'collectedAmount': clean('Collected Amount'), 's3_planned': clean('Planned1'), 's3_actual': clean('Actual1'),
          's4_planned': clean('Planned2'), 's4_actual': clean('Actual2'), 's4_delay': clean('Delay2'),
          'amount': clean('Amonut'), 's5_planned': clean('Planned3'), 's5_actual': clean('Actual3'), 's5_delay': clean('Delay3'),
          'vendorName': clean('Vendor Name'), 'vendorAmount': clean('Vendor Amount'), 'itemName': clean('Item Name'), 'qty': clean('Qty'),
          'remark': clean('Remark'), 's2_planned': clean('Planned'), 's2_actual': clean('Actual'), 'approval': clean('Approval'), 'note': clean('Note'),
          'piCopy': clean('PI Copy')
        };

        const piColIndex = headingMap[keyMap.piNo];
        if (!piColIndex) return;

        let targetRow = lastRow + 1;
        let isUpdate = false;
        const searchPi = clean(piNo);
        const shouldAppend = record.step === 'payment-received';

        if (!shouldAppend && lastRow >= START_ROW) {
          const piNos = sheet.getRange(START_ROW, piColIndex, lastRow - START_ROW + 1, 1).getValues();
          for (let i = piNos.length - 1; i >= 0; i--) {
            if (clean(piNos[i][0]) === searchPi && searchPi !== "") {
              targetRow = START_ROW + i;
              isUpdate = true;
              break;
            }
          }
        }

        let rowFormulas = (targetRow <= sheet.getMaxRows()) ? sheet.getRange(targetRow, 1, 1, 40).getFormulas()[0] : [];
        for (const [apiKey, sheetKey] of Object.entries(keyMap)) {
          const colIndex = headingMap[sheetKey];
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
