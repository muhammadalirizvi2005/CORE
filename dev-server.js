// Development server for API routes
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple AI response generator (no API needed)
function generateStudyResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Pattern matching for common study questions
  if (msg.includes('study') || msg.includes('learn')) {
    return "Here are some effective study strategies:\n\n• Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break\n• Active recall: Test yourself instead of just re-reading\n• Space out your study sessions over multiple days\n• Use the Task Manager to break large topics into smaller chunks\n• Teach the concept to someone else to reinforce your understanding\n\nWhat specific subject are you studying?";
  }
  
  if (msg.includes('stress') || msg.includes('anxious') || msg.includes('overwhelm')) {
    return "I understand that academic stress can be challenging. Here are some tips:\n\n• Use the Wellness Tracker to monitor your stress levels daily\n• Take regular breaks - the 25/5 Pomodoro cycle helps prevent burnout\n• Break overwhelming tasks into smaller, manageable steps\n• Remember: It's okay to ask for help from professors or tutors\n• Practice self-care: Get enough sleep, exercise, and healthy meals\n\nHow are you feeling right now? Have you checked in with the Wellness Tracker today?";
  }
  
  if (msg.includes('time') || msg.includes('manage') || msg.includes('schedule')) {
    return "Time management is crucial for academic success! Try these strategies:\n\n• Use the Task Manager to prioritize your assignments by due date\n• Set realistic goals - don't overcommit\n• Use the Pomodoro Timer for focused work sessions\n• Track your most productive hours and schedule hard tasks then\n• Build in buffer time for unexpected issues\n\nWould you like help breaking down a specific task?";
  }
  
  if (msg.includes('exam') || msg.includes('test') || msg.includes('quiz')) {
    return "Preparing for exams? Here's an effective study plan:\n\n• Start studying at least a week before (more for midterms/finals)\n• Create a study schedule using the Task Manager\n• Use active recall: Practice problems and flashcards\n• Form a study group - check out the Study Groups feature!\n• Get good sleep the night before\n• Review your Grade Tracker to identify weak areas\n\nWhat subject is your exam on?";
  }
  
  if (msg.includes('procrastinate') || msg.includes('motivat')) {
    return "Struggling with motivation? You're not alone! Try these techniques:\n\n• Start with just 5 minutes - often the hardest part is beginning\n• Use the Pomodoro Timer - 25 minutes feels manageable\n• Break tasks into tiny steps in your Task Manager\n• Reward yourself after completing tasks\n• Remove distractions: phone away, close unnecessary tabs\n• Remember your goals - why are you in school?\n\nWhat task have you been putting off?";
  }
  
  if (msg.includes('grade') || msg.includes('gpa') || msg.includes('score')) {
    return "Concerned about grades? Here's how to improve:\n\n• Track all your grades in the Grade Tracker to identify patterns\n• Attend office hours - professors appreciate students who try\n• Review graded work to learn from mistakes\n• Form study groups for difficult classes\n• Prioritize assignments by weight/importance\n• Focus on understanding, not just memorization\n\nWhich class are you most concerned about?";
  }
  
  if (msg.includes('help') || msg.includes('can you') || msg.includes('how')) {
    return "I'm here to help you succeed! I can assist with:\n\n📚 Study strategies and learning techniques\n⏰ Time management and productivity tips\n📝 Homework help (I'll guide you, not give answers)\n🎯 Exam preparation strategies\n💚 Stress management and wellness\n📊 Course planning and academic advice\n✨ Organization tips\n\nI work alongside your app's features: Task Manager, Grade Tracker, Pomodoro Timer, Wellness Tracker, and Study Groups.\n\nWhat would you like help with today?";
  }
  
  // Default response
  return "That's a great question! As your study assistant, I'm here to help you with:\n\n• Study techniques and learning strategies\n• Time management and staying organized\n• Managing stress and staying motivated\n• Exam preparation tips\n• Breaking down complex assignments\n\nCould you tell me more about what you're working on? The more specific you are, the better I can help!";
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    // Generate response using pattern matching
    const aiMessage = generateStudyResponse(lastUserMessage.content);

    return res.status(200).json({ 
      message: aiMessage,
      model: 'study-assistant-v1',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Dev API server running on http://localhost:' + PORT);
  console.log('✅ Using free pattern-matching AI (no API key needed)');
});
