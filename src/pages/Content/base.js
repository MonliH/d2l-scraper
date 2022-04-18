chrome.runtime.onMessage.addListener((req, sender, res) => {
  switch (req.type) {
    case 'remove':
      const selectors = [
        'body > div.d2l-shim.d2l-shim-opaque',
        // 'body > div.d2l-dialog.d2l-dialog-mvc',
      ];
      for (const selector of selectors) {
        const toDelete = document.querySelector(selector);
        if (toDelete) toDelete.remove();
      }
      break;
    default:
      break;
  }
});
