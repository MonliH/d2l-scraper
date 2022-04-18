const { reduceEachTrailingCommentRange } = require('typescript');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// <a href="https://docs.google.com/document/d/14gmmM6npzu1F5oZmm61O8-3sUB-zqyHz/edit?usp=drivesdk&amp;ouid=108181645978250717545&amp;rtpof=true&amp;sd=true">testing</a>
// <br></br>
// <a href="https://docs.google.com/presentation/d/13e_duvAqbFHrr7oftOFY1JxkI9JKIz9lc7BdkMdGYAs/edit?usp=sharing">testing</a>
chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  switch (msg.type) {
    case 'download':
      (async () => {
        const allElements = document.querySelectorAll(
          '#root-wrapper > div.main-wrapper > div.root > div.main > div.navigation-container > div > div > div > div.navigation-item'
        );
        for (const e of allElements) {
          e.click();
          await sleep(500);
          const downloadButton = document.querySelector(
            '#content-header > div.header-button-tray > d2l-button-icon'
          );
          if (downloadButton) {
            downloadButton.click();
            await sleep(250);
            chrome.runtime.sendMessage({ type: 'remove' });
          }
          e.click();
        }
        const tabIds = [];
        const urls = [];
        const openAll = async (roots, level) => {
          for (const root of roots) {
            for (const e of root.children) {
              //   console.log(e);
              e.click();
              await sleep(200);
              const contentBlock = document.querySelector('#content-block');
              //   console.log(contentBlock.textContent);
              const urlsFound = contentBlock.getElementsByTagName('a');
              for (const url of urlsFound) {
                const urlObj = new URL(url);
                const ok = urlObj.hostname === 'docs.google.com';
                if (!ok) continue;
                urls.push(url.href);
                const tab = await new Promise((resolve) =>
                  chrome.runtime.sendMessage(
                    {
                      forBackground: true,
                      type: 'openTab',
                      url: url.href,
                    },
                    (tabId) => {
                      resolve(tabId);
                    }
                  )
                );
                tabIds.push(tab);
              }
              const children = e.querySelectorAll('div[role=group]');
              //   console.log(`children of ${contentBlock.textContent}`, children);
              //   console.log(e);
              await openAll(children, level + 1);
              //   console.log('clicking ok', fullPath(e));
              e.click();
            }
          }
        };
        for (const elem of allElements) {
          elem.click();
          await sleep(700);
          await openAll(elem.querySelectorAll('div[role=group]'), 0);
          elem.click();
          await sleep(100);
          elem.click();
        }

        // for (const url of urls) {
        //   const tab = await new Promise((resolve) =>
        //     chrome.runtime.sendMessage(
        //       {
        //         forBackground: true,
        //         type: 'openTab',
        //         url,
        //       },
        //       (tabId) => {
        //         resolve(tabId);
        //       }
        //     )
        //   );
        //   tabIds.push(tab);
        //   //   await sleep(500);
        // }
        await sleep(30000);

        chrome.runtime.sendMessage({
          forBackground: true,
          type: 'downloadTabs',
          urls,
          tabIds,
        });
      })();
      break;
    default:
      break;
  }
});
