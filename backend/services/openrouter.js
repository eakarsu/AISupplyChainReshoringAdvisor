require('dotenv').config({ path: '../.env' });

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
  const model = process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey || !model || !baseUrl) throw new Error('Exact OpenRouter configuration is required');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${baseUrl}/chat/completions`, {
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
    const content = String(data.choices?.[0]?.message?.content || '').trim();
    if (!content) throw new Error('OpenRouter returned empty content');

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
    throw error;
  }
}

module.exports = { queryOpenRouter, parseAIJson };
