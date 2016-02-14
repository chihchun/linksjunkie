chrome.commands.onCommand.addListener(function(command) {
  if (command == "toggle-copy") {
    // Get the currently selected tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // chrome.tabs.query invokes the callback with a list of tabs that match the
      // query. When the popup is opened, there is certainly a window and at least
      // one tab, so we can safely assume that |tabs| is a non-empty array.
      // A window can only have one active tab at a time, so the array consists of
      // exactly one tab.
      var tab = tabs[0];
      if(tab.url.indexOf("chrome:") != 0) {
        chrome.tabs.executeScript(tab.id, {file: "script.js"});
      }
    });
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === 'copyurl') {
      // console.log(request.linkdata);
      getFormat(function(format) {
        var buf = parseText(format, request.linkdata);
        copyToClipBoard(buf);
        notify(buf);
      });
    }
});

updateContextMenu();
