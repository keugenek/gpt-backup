chrome.runtime.sendMessage({action: "executeScript"}, function(response) {
    console.log(response);
  });
  