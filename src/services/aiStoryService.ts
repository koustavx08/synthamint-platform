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
    const { prompts, model } = options;
    
    // Auto-select the best available AI service if no model specified
    if (!model) {
      return this.autoSelectAndGenerate(prompts);
    }
    
    // Use specified model
    if (model === 'openai') {
      return this.generateWithOpenAI(prompts);
    } else {
      return this.generateWithGemini(prompts);
    }
  }

  /**
   * Auto-select the best available AI service for story generation
   */
  private async autoSelectAndGenerate(prompts: string[]): Promise<StoryGenerationResult> {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Check if we have valid API keys
    const hasValidOpenAI = openaiKey && openaiKey !== 'your_openai_api_key_here';
    const hasValidGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
    
    // If no valid API keys, return demo
    if (!hasValidOpenAI && !hasValidGemini) {
      return this.generateDemoStory(prompts);
    }
    
    // Prefer OpenAI for better reliability and quality
    if (hasValidOpenAI) {
      try {
        return await this.generateWithOpenAI(prompts);
      } catch (error) {
        console.warn('OpenAI story generation failed, trying Gemini fallback:', error);
        
        // If OpenAI fails and we have Gemini, try it
        if (hasValidGemini) {
          try {
            return await this.generateWithGemini(prompts);
          } catch (geminiError) {
            console.warn('Gemini fallback also failed, using demo:', geminiError);
            return this.generateDemoStory(prompts);
          }
        }
        
        // No Gemini available, use demo
        return this.generateDemoStory(prompts);
      }
    }
    
    // Only Gemini available
    if (hasValidGemini) {
      try {
        return await this.generateWithGemini(prompts);
      } catch (error) {
        console.warn('Gemini story generation failed, using demo:', error);
        return this.generateDemoStory(prompts);
      }
    }
    
    // Final fallback
    return this.generateDemoStory(prompts);
  }

  /**
   * Generate story using OpenAI
   */
  private async generateWithOpenAI(prompts: string[]): Promise<StoryGenerationResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return this.generateDemoStory(prompts);
    }
    
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
      console.warn('OpenAI story generation failed:', errorData);
      
      // If quota exceeded, rate limited, or billing issues, fall back to demo
      if (response.status === 429 || 
          errorData.error?.message?.includes('quota') ||
          errorData.error?.message?.includes('billing') ||
          errorData.error?.message?.includes('insufficient')) {
        console.warn('OpenAI quota/billing issue, falling back to demo mode');
        return this.generateDemoStory(prompts);
      }
      
      throw new Error(errorData.error?.message || 'Failed to generate story with OpenAI');
    }
    
    const data = await response.json();
    return { story: data.choices[0].message.content.trim() };
  }

  /**
   * Generate story using Gemini
   */
  private async generateWithGemini(prompts: string[]): Promise<StoryGenerationResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.generateDemoStory(prompts);
    }
    
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
      console.warn('Gemini story generation failed:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate story with Gemini');
    }
    
    const data = await response.json();
    return { story: data.candidates[0].content.parts[0].text.trim() };
  }

  /**
   * Generate a demo story when API keys aren't available
   */
  private generateDemoStory(prompts: string[]): StoryGenerationResult {
    const demoStories = [
      "In a world where dreams and reality intertwine, our hero embarks on an extraordinary journey. Through mystical landscapes and challenging trials, they discover that the power to change their destiny lies within their own courage and determination. Each step forward reveals new mysteries, each challenge overcome brings them closer to understanding their true purpose.",
      
      "Once upon a time, in a realm beyond imagination, magic flowed through every corner of existence. The protagonist found themselves at the center of an ancient prophecy, tasked with restoring balance to a world on the brink of chaos. With unlikely allies and powerful artifacts, they must navigate treacherous paths and face their deepest fears.",
      
      "In the heart of a bustling metropolis, where technology and wonder coexist, an ordinary person discovers they possess extraordinary abilities. As they learn to harness their newfound powers, they uncover a hidden world of adventure, mystery, and purpose that will change their life forever.",
    ];
    
    // Select a random demo story or create one based on prompts
    let story = demoStories[Math.floor(Math.random() * demoStories.length)];
    
    // If we have prompts, try to incorporate them
    if (prompts.length > 0) {
      const promptSummary = prompts.slice(0, 3).join(', ');
      story = `[DEMO MODE] This is a sample story incorporating elements like: ${promptSummary}. ${story}`;
    } else {
      story = `[DEMO MODE] ${story}`;
    }
    
    story += "\n\n✨ This is a demo story. Add valid API keys (OpenAI or Gemini) to generate custom stories based on your prompts.";
    
    return { story };
  }
}

export const aiStoryService = AIStoryService.getInstance();
