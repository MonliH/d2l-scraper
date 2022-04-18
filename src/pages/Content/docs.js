function simulate(element, eventName) {
  var options = extend(defaultOptions, arguments[2] || {});
  var oEvent,
    eventType = null;

  for (var name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType)
    throw new SyntaxError(
      'Only HTMLEvents and MouseEvents interfaces are supported'
    );

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType == 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(
        eventName,
        options.bubbles,
        options.cancelable,
        document.defaultView,
        options.button,
        options.pointerX,
        options.pointerY,
        options.pointerX,
        options.pointerY,
        options.ctrlKey,
        options.altKey,
        options.shiftKey,
        options.metaKey,
        options.button,
        element
      );
    }
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = document.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent('on' + eventName, oEvent);
  }
  return element;
}

function extend(destination, source) {
  for (var property in source) destination[property] = source[property];
  return destination;
}

var eventMatchers = {
  HTMLEvents:
    /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  MouseEvents: /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
};
var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// let loaded = { v: false };
// window.addEventListener('load', () => {
//   console.log('loaded');
//   loaded.v = true;
// });

// function load() {
//   return new Promise(function (resolve, reject) {
//     console.log('promise');
//     if (loaded.v) {
//       resolve();
//       return;
//     }
//     window.addEventListener('load', resolve);
//   });
// }

let start = async (docType) => {
  const fileMenu = document.querySelector('#docs-file-menu');
  simulate(fileMenu, 'mousedown');
  simulate(fileMenu, 'mouseup');
  const download = document.querySelector('span[aria-label="Download d"]')
    .parentElement.parentElement;
  simulate(download, 'mouseover');
  simulate(download, 'mousedown');

  await sleep(500);

  const trialList =
    docType === 'document'
      ? [
          'span[aria-label="Microsoft Word (.docx) x"]',
          'span[aria-label="Microsoft Word (.doc) d"]',
          'span[aria-label="PDF document (.pdf) p"]',
        ]
      : [
          'span[aria-label="Microsoft PowerPoint (.pptx) x"]',
          'span[aria-label="PDF document (.pdf) p"]',
        ];
  for (const trial of trialList) {
    const down = document.querySelector(trial);
    if (down && down.parentElement) {
      simulate(down.parentElement, 'mouseover');
      simulate(down.parentElement, 'mousedown');
      simulate(down.parentElement, 'mouseup');
      break;
    }
  }
};
let loaded = { loaded: false, called: false, fn: null };
document.addEventListener('DOMContentLoaded', () => {
  loaded.loaded = true;
  if (loaded.called) {
    loaded.fn();
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  const url = new URL(msg.url);
  const docType = url.pathname.split('/')[1];
  const fn = (async () => {
    await start(docType);
    sendRes();
  })();
  if (msg.type === 'downloadDocs') {
    loaded.called = true;
    loaded.fn = fn;
    if (loaded.loaded) {
      fn();
    }
  }
  return true;
});
