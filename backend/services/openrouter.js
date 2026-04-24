require('dotenv').config({ path: '../.env' });

async function queryOpenRouter(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.',
      fallback: true,
      data: generateFallbackResponse(systemPrompt, userPrompt)
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Supply Chain Reshoring Advisor'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      content: content,
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('OpenRouter error:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true,
      data: generateFallbackResponse(systemPrompt, userPrompt)
    };
  }
}

function generateFallbackResponse(systemPrompt, userPrompt) {
  return `AI Analysis (Demo Mode - Configure API key for live results)\n\nBased on the query: "${userPrompt.substring(0, 100)}..."\n\nThis is a demonstration response. To enable real AI-powered analysis:\n1. Get an API key from openrouter.ai\n2. Add it to your .env file as OPENROUTER_API_KEY\n3. Restart the application\n\nThe AI would provide detailed supply chain reshoring analysis here.`;
}

module.exports = { queryOpenRouter };
