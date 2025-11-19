// API endpoint for AI chatbot
// This uses OpenAI's GPT model, but you can switch to any AI provider

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'Please configure OPENAI_API_KEY in environment variables' 
      });
    }

    // System prompt for the AI assistant
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful AI study assistant for college students. Your role is to help with:

1. Study tips and strategies
2. Time management and productivity
3. Homework and assignment help (explain concepts, don't solve problems)
4. Exam preparation techniques
5. Stress management and wellness
6. Course planning and academic advice
7. Organization and note-taking strategies

Be friendly, encouraging, and concise. If asked about specific homework problems, guide the student to solve it themselves rather than giving direct answers. Always promote healthy study habits and work-life balance.

The student is using a student productivity app with features for task management, grade tracking, pomodoro timers, and wellness tracking. Reference these features when relevant.`
    };

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [systemPrompt, ...messages],
        max_tokens: 500,
        temperature: 0.7,
        user: userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return res.status(200).json({ 
      message: aiMessage,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
}
