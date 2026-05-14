require('dotenv').config({ path: '../.env' });

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3-5-sonnet-20241022';
const TIMEOUT_MS = 30000;

function parseAIJson(text) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try { return JSON.parse(text); } catch (_) {}
  try {
    const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return null;
}

async function queryOpenRouter(systemPrompt, userPrompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return {
      success: false,
      error: 'OpenRouter API key not configured.',
      fallback: true,
      data: generateFallbackResponse(userPrompt),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Supply Chain Reshoring Advisor',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      content,
      parsed: parseAIJson(content),
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('OpenRouter request timed out after 30s');
    } else {
      console.error('OpenRouter error:', error.message);
    }
    return {
      success: false,
      error: 'AI request failed',
      fallback: true,
      data: generateFallbackResponse(userPrompt),
    };
  }
}

function generateFallbackResponse(userPrompt) {
  return `AI Analysis (Demo Mode - Configure API key for live results)\n\nThis is a demonstration response. To enable real AI-powered analysis:\n1. Get an API key from openrouter.ai\n2. Add it to your .env file as OPENROUTER_API_KEY\n3. Restart the application`;
}

module.exports = { queryOpenRouter, parseAIJson };
