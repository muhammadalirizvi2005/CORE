# AI Chatbot Feature

## Overview
Your student productivity app now includes an intelligent AI chatbot assistant powered by OpenAI's GPT! The chatbot helps students with study tips, homework help, time management, and wellness advice.

## Features

### 🤖 AI Study Assistant
- **24/7 Availability**: Always ready to help with your questions
- **Context-Aware**: Understands your app's features (tasks, grades, pomodoro, wellness)
- **Study Support**: Provides study tips, exam prep strategies, and academic advice
- **Homework Help**: Guides you through problems without giving direct answers
- **Wellness Support**: Offers stress management and time management advice
- **Course Planning**: Helps with academic planning and organization

### 💬 Chat Interface
- **Floating Button**: Accessible from anywhere in the app (bottom-right corner)
- **Minimizable**: Minimize the chat window to save screen space
- **Chat History**: Automatically saves your conversation
- **Responsive Design**: Works great on desktop and mobile
- **Real-time**: Get instant AI responses

## How to Use

### Starting a Conversation
1. **Click the AI bot icon** (bottom-right corner) to open the chatbot
2. **Type your question** in the input field
3. **Press Enter** or click the send button
4. **Get instant AI-powered responses**

### Example Questions to Ask
- "How can I study more effectively for exams?"
- "What's the best way to manage my time?"
- "Can you explain this calculus concept?"
- "How do I reduce stress during finals week?"
- "Help me plan my study schedule"
- "What are good note-taking strategies?"
- "How can I stay motivated?"

### Features
- **Minimize**: Click the minimize icon to collapse the chat
- **Close**: Click the X to hide the chatbot completely
- **Clear Chat**: Click "Clear chat" to start a fresh conversation
- **Keyboard Shortcut**: Press Enter to send messages

## Setup Instructions

### For Development (Local)

1. **Get an OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create an account or sign in
   - Click "Create new secret key"
   - Copy the API key (starts with `sk-...`)

2. **Add to Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=sk-your_api_key_here
   ```

3. **Test Locally**:
   ```bash
   npm run dev
   ```
   The chatbot will appear in the bottom-right corner when you're logged in.

### For Production (Vercel)

1. **Add Environment Variable in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add new variable:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: `sk-your_api_key_here`
     - **Environment**: Production, Preview, Development

2. **Redeploy**:
   ```bash
   git push
   ```
   Vercel will automatically redeploy with the new environment variable.

## API Endpoint

The chatbot uses a serverless function at `/api/chat.js`:

### Request Format
```json
{
  "messages": [
    { "role": "user", "content": "How can I study better?" }
  ],
  "userId": "user-id-here"
}
```

### Response Format
```json
{
  "message": "Here are some effective study techniques...",
  "model": "gpt-3.5-turbo",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

## Customization

### Changing the AI Model

Edit `/api/chat.js`:
```javascript
// Use GPT-4 for better responses (costs more)
model: 'gpt-4'

// Use GPT-3.5-turbo for faster, cheaper responses
model: 'gpt-3.5-turbo'
```

### Adjusting Response Length

Edit `/api/chat.js`:
```javascript
max_tokens: 500  // Increase for longer responses
```

### Customizing the System Prompt

Edit `/api/chat.js` to change the assistant's personality and expertise:
```javascript
const systemPrompt = {
  role: 'system',
  content: `Your custom instructions here...`
};
```

### Changing Colors/Theme

Edit `/src/components/AIChatbot.tsx`:
```tsx
// Change gradient colors
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Change to different colors
className="bg-gradient-to-r from-green-600 to-teal-600"
```

## Alternative AI Providers

### Using Anthropic Claude

1. **Install Anthropic SDK**:
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Update `/api/chat.js`**:
   ```javascript
   import Anthropic from '@anthropic-ai/sdk';
   
   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });
   
   const response = await anthropic.messages.create({
     model: 'claude-3-sonnet-20240229',
     max_tokens: 1024,
     messages: messages,
   });
   ```

### Using Google Gemini

1. **Install Google AI SDK**:
   ```bash
   npm install @google/generative-ai
   ```

2. **Update `/api/chat.js`**:
   ```javascript
   import { GoogleGenerativeAI } from "@google/generative-ai";
   
   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
   ```

## Cost Management

### OpenAI Pricing (as of 2024)
- **GPT-3.5-Turbo**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03-0.06 per 1K tokens

### Tips to Reduce Costs
1. **Use GPT-3.5-Turbo** instead of GPT-4
2. **Limit max_tokens** to reduce response length
3. **Set usage limits** in OpenAI dashboard
4. **Add rate limiting** to prevent abuse
5. **Cache responses** for common questions

### Adding Rate Limiting

Edit `/api/chat.js`:
```javascript
// Track requests per user
const requestCounts = new Map();

export default async function handler(req, res) {
  const userId = req.body.userId;
  const count = requestCounts.get(userId) || 0;
  
  if (count > 50) { // Max 50 requests per hour
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  requestCounts.set(userId, count + 1);
  
  // Reset after 1 hour
  setTimeout(() => requestCounts.delete(userId), 3600000);
  
  // ... rest of the code
}
```

## Privacy & Security

### Data Handling
- Chat messages are sent to OpenAI for processing
- Conversations are stored locally in browser (localStorage)
- User ID is sent with requests for tracking
- No personal information is shared beyond what user types

### Best Practices
1. **Don't share sensitive information** with the chatbot
2. **Don't include passwords** or API keys in chat
3. **Review OpenAI's privacy policy**: https://openai.com/policies/privacy-policy
4. **Add disclaimers** if required by your institution

### Adding a Privacy Notice

Edit `/src/components/AIChatbot.tsx` welcome message:
```tsx
content: "Hi! I'm your AI study assistant. Note: Conversations are processed by OpenAI and stored locally. Don't share personal or sensitive information. How can I help you today?"
```

## Troubleshooting

### "AI service not configured"
- **Cause**: `OPENAI_API_KEY` environment variable not set
- **Fix**: Add the API key to `.env.local` or Vercel environment variables

### "Failed to get AI response"
- **Cause**: API rate limit, invalid key, or network error
- **Fix**: Check OpenAI dashboard for API status and usage limits

### Chatbot not appearing
- **Cause**: User not logged in
- **Fix**: Log in to the app first

### Responses too slow
- **Cause**: Using GPT-4 or high max_tokens
- **Fix**: Switch to GPT-3.5-turbo and reduce max_tokens

### Chat history lost
- **Cause**: Browser localStorage cleared
- **Fix**: Chat history is stored locally only - clearing cache removes it

## Future Enhancements

### Potential Features to Add
1. **Voice Input**: Add speech-to-text for hands-free chatting
2. **Context Awareness**: Access user's tasks, grades, and schedule
3. **Proactive Suggestions**: AI suggests study tips based on upcoming deadlines
4. **Multi-language Support**: Support for non-English students
5. **Study Group Chat**: Group chatbot sessions for collaborative learning
6. **Knowledge Base**: Train on your course materials
7. **Export Conversations**: Save important advice as notes
8. **Scheduled Check-ins**: Daily motivation and study reminders

---

**Need Help?** Check the browser console (F12) for detailed error messages and API logs.

**Cost Concerns?** Start with a low OpenAI spending limit ($5-10/month) to test usage patterns.

**Questions?** The chatbot works best with specific questions about studying, time management, and academic success!
