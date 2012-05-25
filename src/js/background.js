/**
 * background.js
 */
var patterns = [
  /http:\/\/vimeo\.com\/[0-9]+/,
  /http(?:s)?:\/\/(?:www\.)?youtube\.com[^ \n]*[\?&]v=[^ &\n]+/,
  /http(?:s)?:\/\/atropa.wurstcase.net\/admin\/profile/
];

chrome.tabs.onUpdated.addListener(function(tabId) {
  chrome.tabs.get(tabId, function(tab) {
    for (var i = 0; i < patterns.length; i++) {
      if (tab.url.match(patterns[i])) {
        return chrome.pageAction.show(tabId);
      }
    }

    chrome.pageAction.hide(tabId);
  });
});

// vim:ts=2:sw=2:expandtab
