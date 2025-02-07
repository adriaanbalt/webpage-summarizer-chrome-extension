document.getElementById('summarize').addEventListener('click', function() {
  const summaryElement = document.getElementById('summary');
  const loadingElement = document.getElementById('loadingSummary');

  this.disabled = true;

  summaryElement.textContent = '';
  loadingElement.style.display = 'block';

  chrome.runtime.sendMessage({action: "summarize"}, function(response) {
    loadingElement.style.display = 'none';
    document.getElementById('summarize').disabled = false;
    if (response.error) {
      summaryElement.textContent = `Error: ${response.error}`;
    } else {
      summaryElement.textContent = response.summary;
    }
  });
});

document.getElementById('submit').addEventListener('click', function() {
  const query = document.getElementById('query').value;
  const queryContainer = document.getElementById('queryResponses');
  const loadingElement = document.getElementById('loadingQuery');

  this.disabled = true;
  
  loadingElement.style.display = 'block';

  chrome.runtime.sendMessage({action: "query", query}, function(response) {
    loadingElement.style.display = 'none';
    document.getElementById('submit').disabled = false;
    if (response.error) {
      queryContainer.textContent += `Error: ${response.error}`;
    } else {
      const child = document.createElement('div');
      child.classList.add('response');
      child.textContent = response.summary;
      queryContainer.appendChild(child);
    }
  });
});
