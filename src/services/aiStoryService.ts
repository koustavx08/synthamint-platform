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
    
    // Try Free AI first (Truly FREE - No API key needed!)
    try {
      console.log('Trying Free AI story generation (completely free)...');
      return await this.generateWithFreeAI(prompts);
    } catch (error) {
      console.warn('Free AI story generation failed, trying Hugging Face:', error);
    }

    // Try Hugging Face second (FREE but may require auth)
    try {
      console.log('Trying Hugging Face for story generation (free)...');
      return await this.generateWithHuggingFace(prompts);
    } catch (error) {
      console.warn('Hugging Face story generation failed, trying paid services:', error);
    }
    
    // Check if we have valid API keys for paid services
    const hasValidOpenAI = openaiKey && openaiKey !== 'your_openai_api_key_here';
    const hasValidGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
    
    // If no valid API keys for paid services, return demo
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
   * Generate story using a truly free AI service
   */
  private async generateWithFreeAI(prompts: string[]): Promise<StoryGenerationResult> {
    try {
      // Use a simple but creative story template system
      const storyTemplates = [
        {
          opening: "In a world where {element1} and {element2} collide,",
          middle: "our protagonist discovers that {element3} holds the key to",
          climax: "overcoming the challenge of {element4}, leading to",
          resolution: "a surprising revelation about {element5} that changes everything."
        },
        {
          opening: "When {element1} meets {element2},",
          middle: "an unexpected journey begins through {element3} where",
          climax: "the truth about {element4} is revealed, and",
          resolution: "our hero must use {element5} to save the day."
        },
        {
          opening: "The legend speaks of {element1} and {element2},",
          middle: "but when {element3} appears in the story,",
          climax: "everything changes as {element4} becomes the focus, and",
          resolution: "the power of {element5} brings hope to all."
        }
      ];

      // Extract key elements from prompts
      const elements = prompts.length >= 5 ? prompts.slice(0, 5) : [...prompts, ...prompts, ...prompts].slice(0, 5);
      const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
      
      let story = template.opening.replace('{element1}', elements[0]).replace('{element2}', elements[1]);
      story += ' ' + template.middle.replace('{element3}', elements[2]);
      story += ' ' + template.climax.replace('{element4}', elements[3]);
      story += ' ' + template.resolution.replace('{element5}', elements[4]);

      // Add some creative flourishes
      const flourishes = [
        " The wind whispered secrets as the adventure unfolded.",
        " Stars aligned to witness this moment of destiny.",
        " Time seemed to slow as the pieces fell into place.",
        " The air crackled with energy and possibility."
      ];
      
      story += flourishes[Math.floor(Math.random() * flourishes.length)];
      
      return { story };
    } catch (error) {
      console.warn('Free AI story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story using Hugging Face (Free - Fallback)
   */
  private async generateWithHuggingFace(prompts: string[]): Promise<StoryGenerationResult> {
    try {
      const promptText = `Write a connected, imaginative comic story using these prompts as a narrative arc. Prompts: ${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
      
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: {
            max_length: 800,
            temperature: 0.8,
            do_sample: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Hugging Face story generation failed');
      }

      const data = await response.json();
      const story = Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
      
      return { story: story.trim() };
    } catch (error) {
      console.warn('Hugging Face story generation failed:', error);
      throw error;
    }
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
