function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const zip = (a, b) => a.map((k, i) => [k, b[i]]);
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  (async () => {
    if (request.forBackground) {
      switch (request.type) {
        case 'downloadTabs':
          const { urls, tabIds } = request;
          await sleep(2000);
          console.log(urls, tabIds);
          for (const [url, tab] of zip(urls, tabIds)) {
            await chrome.tabs.update(tab, { active: true });
            await new Promise((resolve) => {
              chrome.tabs.sendMessage(
                tab,
                { type: 'downloadDocs', url },
                {},
                (res) => {
                  resolve();
                }
              );
            });
            await sleep(100);
            await chrome.tabs.remove(tab);
            await sleep(1000);
          }
          return;
        case 'openTab':
          const res = await chrome.tabs.create({
            url: request.url,
            active: false,
          });
          sendResponse(res.id);
          return;
        default:
          sendResponse();
          return;
      }
    }
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log('bgs: forwarded ' + request + ' to the tab ' + tab.id);
    chrome.tabs.sendMessage(tab.id, request, function (response) {
      console.log(
        'bgs: forwarded ' + response + ' to the caller ' + sender.tab.id
      );
      if (sendResponse) sendResponse(response);
    });
    return;
  })();
  return true;
});
