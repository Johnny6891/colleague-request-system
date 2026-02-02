/**
 * 同事需求管理系統 - Google Apps Script 後端
 * 
 * 部署步驟：
 * 1. 在 Google Sheet 中建立新的 Apps Script 專案
 * 2. 貼上此程式碼
 * 3. 部署 > 新增部署項目 > 網頁應用程式
 * 4. 執行身分：我自己，存取權限：任何人
 * 5. 複製網址到前端 .env 的 VITE_GAS_URL
 */

// Sheet 設定
const SHEET_NAME = '需求列表';
const HEADERS = ['ID', 'Requester', 'Description', 'Status', 'CreatedAt', 'CompletedAt'];

/**
 * 初始化 Sheet（首次執行）
 */
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * GET 請求處理 (所有操作都用 GET 避免 CORS)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAll') {
    return getAllRequests();
  }
  
  if (action === 'add') {
    return addRequest(e.parameter);
  }
  
  if (action === 'update') {
    return updateRequest(e.parameter);
  }
  
  if (action === 'delete') {
    return deleteRequest(e.parameter);
  }
  
  if (action === 'optimize') {
    return optimizeDescription(e.parameter.description);
  }
  
  return jsonResponse({ error: 'Unknown action' });
}

/**
 * POST 請求處理 (備用)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'add') {
      return addRequest(data.request || data);
    }
    
    if (action === 'update') {
      return updateRequest(data.request || data);
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
  
  return jsonResponse({ error: 'Unknown action' });
}

/**
 * 取得所有需求
 */
function getAllRequests() {
  const sheet = initSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return jsonResponse({ requests: [] });
  }
  
  const requests = data.slice(1).map(row => ({
    id: row[0],
    requester: row[1],
    description: row[2],
    status: row[3],
    createdAt: row[4],
    completedAt: row[5] || null,
  }));
  
  return jsonResponse({ requests });
}

/**
 * 新增需求
 */
function addRequest(params) {
  const sheet = initSheet();
  
  sheet.appendRow([
    params.id,
    params.requester,
    params.description,
    params.status,
    params.createdAt,
    params.completedAt || '',
  ]);
  
  return jsonResponse({ success: true });
}

/**
 * 更新需求
 */
function updateRequest(params) {
  const sheet = initSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      const row = i + 1;
      sheet.getRange(row, 4).setValue(params.status);
      sheet.getRange(row, 6).setValue(params.completedAt || '');
      return jsonResponse({ success: true });
    }
  }
  
  return jsonResponse({ error: 'Request not found' });
}

/**
 * JSON 回應
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 刪除需求
 */
function deleteRequest(params) {
  const sheet = initSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  
  return jsonResponse({ error: 'Request not found' });
}

/**
 * 使用 Gemini API 優化需求描述
 */
function optimizeDescription(description) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return jsonResponse({ error: 'Gemini API Key not configured' });
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `你是一位專業的需求分析師。請將以下需求描述重新組織成結構清晰、易於理解的格式。

原始需求：
${description}

請用以下格式輸出（保持簡潔）：
📌 目標：[一句話說明要達成什麼]
📝 細節：[條列式說明具體內容]
✅ 驗收條件：[如何確認完成]

注意：直接輸出結果，不要有任何開頭語或解釋。`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.candidates && result.candidates[0]) {
      const optimized = result.candidates[0].content.parts[0].text;
      return jsonResponse({ success: true, optimized });
    }
    
    return jsonResponse({ error: 'Failed to get response from Gemini' });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}
