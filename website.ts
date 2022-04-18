function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// <a href="https://docs.google.com/document/d/14gmmM6npzu1F5oZmm61O8-3sUB-zqyHz/edit?usp=drivesdk&amp;ouid=108181645978250717545&amp;rtpof=true&amp;sd=true">testing</a>
// <br></br>
// <a href="https://docs.google.com/presentation/d/13e_duvAqbFHrr7oftOFY1JxkI9JKIz9lc7BdkMdGYAs/edit?usp=sharing">testing</a>

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  switch (msg.type) {
    case 'download':
      (async () => {
        const allElements: NodeListOf<HTMLElement> = document.querySelectorAll(
          '#root-wrapper > div.main-wrapper > div.root > div.main > div.navigation-container > div > div > div > div.navigation-item'
        );

        for (const e of allElements) {
          e.click();
          await sleep(500);
          const downloadButton = document.querySelector(
            '#content-header > div.header-button-tray > d2l-button-icon'
          ) as HTMLElement;
          if (downloadButton) {
            downloadButton.click();
            await sleep(250);
            chrome.runtime.sendMessage({ type: 'remove' });
          }
          e.click();
        }

        const openAll = async (roots: NodeListOf<HTMLDivElement>) => {
          for (const e of roots) {
            e.click();
            const contentBlock = document.querySelector(
              '#content-block'
            ) as HTMLElement;
            console.log(contentBlock.textContent);
            const urls: HTMLCollectionOf<HTMLAnchorElement> =
              contentBlock.getElementsByTagName('a');
            for (const url of urls) {
              console.log(url.href);
            }
            const children: NodeListOf<HTMLDivElement> =
              e.querySelectorAll('div[role=group]');
            openAll(children);

            e.click();
          }
        };

        await openAll(document.querySelectorAll('div[role=group]'));
      })();

      break;
    default:
      break;
  }
});
