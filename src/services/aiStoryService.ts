export interface StoryGenerationOptions {
  prompts: string[];
  model?: 'openai' | 'gemini';
}

export interface StoryGenerationResult {
  story: string;
}

export class AIStoryService {
  private static instance: AIStoryService;

  public static getInstance(): AIStoryService {
    if (!AIStoryService.instance) {
      AIStoryService.instance = new AIStoryService();
    }
    return AIStoryService.instance;
  }

  async generateStory(options: StoryGenerationOptions): Promise<StoryGenerationResult> {
    const { prompts, model = 'gemini' } = options;
    if (model === 'openai') {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) throw new Error('OpenAI API key not configured');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a creative comic story writer. Given a sequence of prompts, write a connected, engaging, and imaginative story that links all prompts as a narrative arc. Return only the story.' },
            { role: 'user', content: `Prompts: ${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}` }
          ],
          max_tokens: 800,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate story with OpenAI');
      }
      const data = await response.json();
      return { story: data.choices[0].message.content.trim() };
    } else {
      // Gemini (Google AI)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API key not configured');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `Write a connected, imaginative comic story using these prompts as a narrative arc. Prompts: ${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}` }] }
          ]
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate story with Gemini');
      }
      const data = await response.json();
      return { story: data.candidates[0].content.parts[0].text.trim() };
    }
  }
}

export const aiStoryService = AIStoryService.getInstance();
