# Quick Start: AI Chatbot Setup

## 🚀 Get Your AI Chatbot Running in 5 Minutes

### Step 1: Get OpenAI API Key (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click **"Create new secret key"**
4. Name it "CORE App Chatbot"
5. **Copy the key** (starts with `sk-...`)
6. ⚠️ Save it somewhere safe - you won't see it again!

### Step 2: Add API Key to Your App (1 minute)

**For Local Development:**
1. Create a file named `.env.local` in your project root
2. Add this line:
   ```
   OPENAI_API_KEY=sk-your_actual_api_key_here
   ```
3. Save the file

**For Vercel Production:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Name: `OPENAI_API_KEY`
6. Value: `sk-your_actual_api_key_here`
7. Select all environments (Production, Preview, Development)
8. Click **Save**

### Step 3: Test It! (2 minutes)

**Local Testing:**
```bash
npm run dev
```

**What You Should See:**
1. Open http://localhost:5173
2. Login to your account
3. Look for a **blue/purple bot icon** in the bottom-right corner
4. Click it to open the chatbot
5. Type: "How can you help me?"
6. You should get an AI response!

### Step 4: Deploy (if using Vercel)
```bash
git add -A
git commit -m "Add AI chatbot feature"
git push
```

Vercel will automatically deploy with your new environment variable.

## 💰 Cost Management

### Set OpenAI Spending Limits
1. Go to https://platform.openai.com/settings/organization/billing/limits
2. Set a **monthly budget limit** (e.g., $5-10 for testing)
3. Add a **payment method**
4. Enable **email alerts** for usage thresholds

### Expected Costs
- Testing (100 conversations): ~$0.10-0.50
- Light usage (1,000 messages/month): ~$1-5
- Moderate usage (10,000 messages/month): ~$10-50

💡 **Tip**: Start with a $10 limit to test without surprises!

## ✅ Verify It's Working

### Test Checklist:
- [ ] Bot icon appears when logged in
- [ ] Clicking icon opens chat window
- [ ] Can type and send messages
- [ ] AI responds within 2-5 seconds
- [ ] Chat history persists when reopening
- [ ] Can minimize and close the chat
- [ ] "Clear chat" button works

### If Something's Wrong:

**Bot icon not showing:**
- Make sure you're logged in to the app
- Check browser console (F12) for errors

**"AI service not configured" error:**
- Verify `OPENAI_API_KEY` is in `.env.local` or Vercel
- Make sure the key starts with `sk-`
- Restart your dev server (`Ctrl+C` then `npm run dev`)

**API key invalid:**
- Check for typos in the API key
- Generate a new key from OpenAI dashboard
- Make sure you copied the entire key

**Responses failing:**
- Check OpenAI dashboard for API status
- Verify you have credits in your OpenAI account
- Check browser console for detailed error messages

## 🎯 Quick Feature Test

Try asking the chatbot:

1. **"How can you help me?"**
   - Should list available features

2. **"Give me 3 study tips"**
   - Should provide study advice

3. **"How do I reduce stress during exams?"**
   - Should give wellness advice

4. **"What's the Pomodoro Technique?"**
   - Should explain time management

If all responses work, you're good to go! 🎉

## 📱 Using the Chatbot

### Opening:
- Click the bot icon (bottom-right)
- Chat window slides up

### Chatting:
- Type your question
- Press **Enter** or click send button
- AI responds in 2-5 seconds

### Features:
- **Minimize** (−): Collapse to small window
- **Close** (×): Hide completely
- **Clear chat**: Start fresh conversation
- **Auto-save**: History saved automatically

### Best Questions:
- "How do I study for [subject]?"
- "Help me manage my time better"
- "What are good note-taking strategies?"
- "How can I stay motivated?"
- "Tips for reducing test anxiety"

## 🔧 Next Steps

### Customize Your Bot:
1. Edit `/api/chat.js` to change AI personality
2. Modify system prompt for specific subjects
3. Adjust `max_tokens` for longer/shorter responses
4. Change colors in `/src/components/AIChatbot.tsx`

### Add Features:
- Voice input (speech-to-text)
- Context from your tasks and grades
- Scheduled study reminders
- Export chat as notes

### Monitor Usage:
- Check OpenAI dashboard for usage stats
- Set up email alerts for spending
- Review chat logs for improvements

## 🆘 Need Help?

**Check logs:**
```bash
# Open browser console (F12)
# Look for messages starting with "Chat API error"
```

**OpenAI Dashboard:**
- Usage: https://platform.openai.com/usage
- API Keys: https://platform.openai.com/api-keys
- Status: https://status.openai.com

**Common Issues:**
- API Key Issues → Regenerate key
- Rate Limits → Increase OpenAI limits
- Slow Responses → Switch to GPT-3.5-turbo
- High Costs → Set spending limits

---

**Ready to chat?** Open the app, click the bot icon, and start studying smarter! 🤖📚
