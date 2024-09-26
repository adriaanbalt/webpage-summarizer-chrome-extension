document.getElementById('summarize').addEventListener('click', function() {
  const summaryElement = document.getElementById('summary');
  const loadingElement = document.getElementById('loading');
  
  summaryElement.textContent = '';
  loadingElement.style.display = 'block';

  chrome.runtime.sendMessage({action: "summarize"}, function(response) {
    loadingElement.style.display = 'none';
    console.log("RESPONSE COMPLETED!", response)
    if (response.error) {
      summaryElement.textContent = `Error: ${response.error}`;
    } else {
      summaryElement.textContent = response.summary;
    }
  });
});
