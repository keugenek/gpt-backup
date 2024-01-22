// This function runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function() {
    // log that the extension was installed
    console.log('Extension installed');
});

// When DOM is loaded, execute content script
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('openai.')) {
        console.log("Exec tabs script on update:", chrome.runtime.id);
        chrome.scripting.executeScript({
          target: {tabId: tabId},
          files: ['content.js']
        });
      }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "executeScript") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
              chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                files: ['content.js']
              });
            } else {
              console.error("No active tab found.");
            }
          });
    }
    if (message.action === "saveFile") {
      // process message chrome.runtime.sendMessage({action: "saveFile", filename: filename, file: file }, function(response) {});
      console.log("Saving file:", message.filename);
      const file_url = message.file_url;
      const filename = message.filename;
      chrome.downloads.download({
        url: file_url,
        filename: filename
      });
    }
    return true;
  });
