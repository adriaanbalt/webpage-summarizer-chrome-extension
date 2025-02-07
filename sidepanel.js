
const ANTHROPIC_API_KEY = '';
const OPENAI_API_KEY = '';


function handleApiResponse(response, summaryElement, loadingElement, button) {
  loadingElement.style.display = 'none';
  button.disabled = false;
  if (response.error) {
    summaryElement.textContent = `Error: ${response.error}`;
  } else {
    summaryElement.textContent = response.summary;
  }
}

function summarize(openaiApiKey, anthropicApiKey, summaryElement, loadingElement, button) {
  if (!openaiApiKey && !anthropicApiKey) {
    loadingElement.style.display = 'none';
    button.disabled = false;
    summaryElement.textContent = 'Your API keys are empty.';
    return;
  }

  chrome.runtime.sendMessage({
    action: "summarize",
    openaiApiKey: openaiApiKey,
    anthropicApiKey: anthropicApiKey
  }, function(response) {
    handleApiResponse(response, summaryElement, loadingElement, button);
  });
}

function query(openaiApiKey, anthropicApiKey, query, queryContainer, loadingElement, errorContainer, button) {
  if (!openaiApiKey && !anthropicApiKey) {
    loadingElement.style.display = 'none';
    button.disabled = false;
    queryContainer.textContent = 'Your API keys are empty.';
    return;
  }

  chrome.runtime.sendMessage({
    action: "query",
    query,
    openaiApiKey: openaiApiKey,
    anthropicApiKey: anthropicApiKey
  }, function(response) {
    loadingElement.style.display = 'none';
    button.disabled = false;
    if (response.error) {
      errorContainer.textContent = `Error: ${response.error}`;
    } else {
      const child = document.createElement('div');
      child.classList.add('response');
      child.textContent = response.summary;
      queryContainer.appendChild(child);
    }
  });
}

document.getElementById('summarize').addEventListener('click', function() {
  const summaryElement = document.getElementById('summary');
  const loadingElement = document.getElementById('loadingSummary');
  const summaryError = document.getElementById('summaryError');
  let openaiApiKey = document.getElementById('openaiApiKey').value;
  let anthropicApiKey = document.getElementById('anthropicApiKey').value;

  if ( !openaiApiKey ) {
    openaiApiKey = document.getElementById('openaiApiKey').value = OPENAI_API_KEY
  } else if ( !anthropicApiKey ) {
    anthropicApiKey = document.getElementById('anthropicApiKey').value = ANTHROPIC_API_KEY
  }

  this.disabled = true;
  summaryElement.textContent = '';
  loadingElement.style.display = 'block';

  summarize(openaiApiKey, anthropicApiKey, summaryElement, loadingElement, summaryError, this);
});

document.getElementById('submit').addEventListener('click', function() {
  const queryValue = document.getElementById('query').value;
  const queryContainer = document.getElementById('queryResponses');
  const queryError = document.getElementById('queryError');
  const loadingElement = document.getElementById('loadingQuery');
  let openaiApiKey = document.getElementById('openaiApiKey').value;
  let anthropicApiKey = document.getElementById('anthropicApiKey').value;

  if ( !openaiApiKey ) {
    openaiApiKey = document.getElementById('openaiApiKey').value = OPENAI_API_KEY
  } else if ( !anthropicApiKey ) {
    anthropicApiKey = document.getElementById('anthropicApiKey').value = ANTHROPIC_API_KEY
  }

  console.log('openaiApiKey after:', openaiApiKey)
  this.disabled = true;
  loadingElement.style.display = 'block';

  query(openaiApiKey, anthropicApiKey, queryValue, queryContainer, loadingElement, queryError, this);
});
