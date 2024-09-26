function extractTextContent() {
  const bodyElement = document.body;
  console.log('bodyElement', bodyElement.innerText);
  return bodyElement.innerText;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('on message received', request)
  if (request.action === "extractText") {
    const extractedText = extractTextContent();
    sendResponse({text: extractedText});
  }
});
console.log('Content script loaded and ready to receive messages.');
