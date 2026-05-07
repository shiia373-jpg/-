const gmNameInput = document.getElementById('gmName');
const apiUrlInput = document.getElementById('apiUrl');
const toggleBtn = document.getElementById('toggleBtn');
const status = document.getElementById('status');

let enabled = false;

chrome.storage.sync.get(['gmName', 'apiUrl', 'enabled'], (result) => {
  gmNameInput.value = result.gmName || 'GM';
  apiUrlInput.value = result.apiUrl || 'http://136.109.45.122:3000';
  enabled = result.enabled || false;
  updateBtn();
});

function updateBtn() {
  toggleBtn.textContent = enabled ? '● 連携中' : '○ 連携OFF';
  toggleBtn.className = enabled ? 'active' : '';
}

function save() {
  const settings = {
    gmName: gmNameInput.value.trim() || 'GM',
    apiUrl: apiUrlInput.value.trim() || 'http://136.109.45.122:3000',
    enabled,
  };
  chrome.storage.sync.set(settings);
  chrome.tabs.query({ url: 'https://ccfolia.com/*' }, (tabs) => {
    tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { type: 'updateSettings', ...settings }));
  });
  status.textContent = '保存しました';
  setTimeout(() => { status.textContent = ''; }, 1500);
}

toggleBtn.addEventListener('click', () => {
  enabled = !enabled;
  updateBtn();
  save();
});

gmNameInput.addEventListener('change', save);
apiUrlInput.addEventListener('change', save);
