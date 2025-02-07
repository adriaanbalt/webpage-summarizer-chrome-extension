const ANTHROPIC_API_KEY =  'sk-ant-'// your anthropic key
const OPENAI_API_KEY = 'sk-proj-'; // your openai key

async function sendToClaudeAI(text) {
  const apiUrl = 'https://api.anthropic.com/v1/messages';
  
  const requestBody = {
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: text
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude AI:', error);
    throw error;
  }
}

async function sendToOpenAI(text) {
  console.log('sendToOpenAI', text)
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const requestBody = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes web page content."
      },
      {
        role: "user",
        content: text
      }
    ],
    max_tokens: 500
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

async function summarizeText(text, aiService = 'openai') {
  const promptWrapper = `Please determine the subject matter based on the following text and provide a summary. If some of the text does not relate to the overall subject matter, please remove it from your analysis summary:\n\n${text}`;
  try {
    if (aiService === 'claude') {
      return await sendToClaudeAI(promptWrapper);
    } else if (aiService === 'openai') {
      return await sendToOpenAI(promptWrapper);
    } else {
      throw new Error('Invalid AI service specified');
    }
  } catch (error) {
    console.error('Error in summarizeText:', error);
    throw error;
  }
}

async function queryText(query, text, aiService = 'openai') {
  const promptWrapper = `Please determine the subject matter based on the following <text>. If some of the <text> does not relate to the overall subject matter, please remove it from your analysis. From this resulting text, answer this question: <question>${query}</question>. <text>${text}</text`;

  console.log('promptWrapper', promptWrapper)
  try {
    if (aiService === 'claude') {
      return await sendToClaudeAI(promptWrapper);
    } else if (aiService === 'openai') {
      return await sendToOpenAI(promptWrapper);
    } else {
      throw new Error('Invalid AI service specified');
    }
  } catch (error) {
    console.error('Error in summarizeText:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request)
  if (request.action === "summarize") {
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) { // Check if there is an active tab
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, {action: "extractText"});
          if (response && response.text) { // Check if response is valid
            const extractedText = response.text;
            const summary = await summarizeText(extractedText, 'openai');
            console.log('summary from ai:', summary);
            sendResponse({summary: summary});
          } else {
            throw new Error('No response from content script');
          }
        } catch (error) {
          console.error('Error:', error); // Debug log
          sendResponse({error: error.message});
        }
      } else {
        sendResponse({error: 'No active tab found'}); // Handle no active tab
      }
    });
    return true;  // Indicates that the response is sent asynchronously
  }
  if (request.action === "query") {
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) { // Check if there is an active tab
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, {action: "extractText"});
          if (response && response.text) { // Check if response is valid
            const extractedText = response.text;
            const summary = await queryText(request.query, extractedText, 'openai');
            console.log('summary from ai:', summary);
            sendResponse({summary: summary});
          } else {
            throw new Error('No response from content script');
          }
        } catch (error) {
          console.error('Error:', error); // Debug log
          sendResponse({error: error.message});
        }
      } else {
        sendResponse({error: 'No active tab found'}); // Handle no active tab
      }
    });
    return true;  // Indicates that the response is sent asynchronously
  }
});


chrome.action.onClicked.addListener((tab) => {
  console.log(' open side panel with tab id', tab.id)
  chrome.sidePanel.open({tabId: tab.id});
});
console.log('Sending message to content script.');