/**
 * Deploy as a Google Apps Script Web App.
 * Add Script Properties: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
 * This endpoint accepts CodePrint order/message notifications.
 */
function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var type = data.type;
    if (type !== 'order' && type !== 'message') return output({ok:false, error:'Unsupported event'});
    var email = String(data.email || '').toLowerCase().trim();
    var cache = CacheService.getScriptCache();
    var key = 'cp_' + type + '_' + Utilities.base64EncodeWebSafe(email || 'unknown').slice(0, 50);
    if (cache.get(key)) return output({ok:false, error:'Rate limited'});
    cache.put(key, '1', 45);
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty('TELEGRAM_BOT_TOKEN');
    var chatId = props.getProperty('TELEGRAM_CHAT_ID');
    if (!token || !chatId) return output({ok:false, error:'Telegram properties are missing'});
    var text;
    if (type === 'order') {
      text = '🛒 <b>New CodePrint order request</b>\n' + 'Order: <code>' + safe(data.id) + '</code>\n' + 'Product: ' + safe(data.productName) + '\n' + 'Customer: ' + safe(data.customerName) + '\n' + 'Email: ' + safe(data.email) + '\n' + 'Details: ' + safe(data.message || '—');
    } else {
      text = '✉️ <b>New CodePrint message</b>\n' + 'Name: ' + safe(data.name) + '\n' + 'Email: ' + safe(data.email) + '\n' + 'Topic: ' + safe(data.topic) + '\n' + 'Message: ' + safe(data.message);
    }
    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {method:'post', contentType:'application/json', payload:JSON.stringify({chat_id:chatId, text:text, parse_mode:'HTML', disable_web_page_preview:true}), muteHttpExceptions:true});
    return output({ok:response.getResponseCode() >= 200 && response.getResponseCode() < 300});
  } catch (err) { return output({ok:false, error:String(err)}); }
}
function safe(value) { return String(value || '—').replace(/[&<>]/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }).slice(0, 1000); }
function output(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
