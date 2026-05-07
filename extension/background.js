chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'relay') {
    fetch(`${msg.apiUrl}/api/relay-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg.text }),
    }).catch(console.error);
  }
});
