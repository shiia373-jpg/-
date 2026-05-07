let gmName = 'GM';
let apiUrl = 'http://136.109.45.122:3000';
let enabled = false;
let lastProcessedIndex = -1;
let lastSentAt = 0;
const COOLDOWN_MS = 5000;

chrome.storage.sync.get(['gmName', 'apiUrl', 'enabled'], (result) => {
  gmName = result.gmName || 'GM';
  apiUrl = result.apiUrl || 'http://136.109.45.122:3000';
  enabled = result.enabled || false;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'updateSettings') {
    gmName = msg.gmName;
    apiUrl = msg.apiUrl;
    enabled = msg.enabled;
  }
});

function extractMessage(el) {
  const h6 = el.querySelector('h6.MuiListItemText-primary');
  const p = el.querySelector('p.MuiListItemText-secondary');
  if (!h6 || !p) return null;
  const nameNode = Array.from(h6.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
  const name = nameNode?.textContent?.trim() || '';
  const text = p.textContent?.trim() || '';
  return { name, text };
}

function relayMessage(text) {
  fetch(`${apiUrl}/api/relay-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).catch((err) => console.error('[BG Sync] relay error:', err));
}

function observeChat() {
  const chatList = document.querySelector('ul.MuiList-root');
  if (!chatList) {
    setTimeout(observeChat, 1000);
    return;
  }

  const observer = new MutationObserver(() => {
    if (!enabled) return;
    const items = chatList.querySelectorAll('[data-index]');
    items.forEach((el) => {
      const index = parseInt(el.getAttribute('data-index'));
      if (index <= lastProcessedIndex) return;
      lastProcessedIndex = index;

      const msg = extractMessage(el);
      if (!msg || msg.name !== gmName || !msg.text) return;

      const now = Date.now();
      if (now - lastSentAt < COOLDOWN_MS) return;
      lastSentAt = now;

      console.log('[BG Sync] relaying:', msg.text);
      relayMessage(msg.text);
    });
  });

  observer.observe(chatList, { childList: true, subtree: true });
  console.log('[BG Sync] watching chat for GM:', gmName);
}

observeChat();
