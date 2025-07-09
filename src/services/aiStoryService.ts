export interface StoryGenerationOptions {
  prompts: string[];
  model?: 'openai' | 'gemini' | 'openrouter' | 'koboldai' | 'huggingface-spaces' | 'auto';
  useComicStyle?: boolean;
  characterDialogue?: boolean;
}

export interface StoryGenerationResult {
  story: string;
  metadata?: {
    model: string;
    generatedAt: string;
    tokenCount?: number;
    style?: string;
  };
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
    const { prompts, model, useComicStyle = true, characterDialogue = false } = options;
    
    // Auto-select the best available AI service if no model specified or 'auto'
    if (!model || model === 'auto') {
      return this.autoSelectAndGenerate(prompts, useComicStyle, characterDialogue);
    }
    
    // Use specified model
    switch (model) {
      case 'openai':
        return this.generateWithOpenAI(prompts, useComicStyle, characterDialogue);
      case 'gemini':
        return this.generateWithGemini(prompts, useComicStyle, characterDialogue);
      case 'openrouter':
        return this.generateWithOpenRouter(prompts, useComicStyle, characterDialogue);
      case 'koboldai':
        return this.generateWithKoboldAI(prompts, useComicStyle, characterDialogue);
      case 'huggingface-spaces':
        return this.generateWithHuggingFaceSpaces(prompts, useComicStyle, characterDialogue);
      default:
        return this.autoSelectAndGenerate(prompts, useComicStyle, characterDialogue);
    }
  }

  /**
   * Auto-select the best available AI service for story generation
   */
  private async autoSelectAndGenerate(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    // Try free services first in order of quality/reliability
    const freeServices = [
      () => this.generateWithOpenRouter(prompts, useComicStyle, characterDialogue),
      () => this.generateWithHuggingFaceSpaces(prompts, useComicStyle, characterDialogue),
      () => this.generateWithKoboldAI(prompts, useComicStyle, characterDialogue),
      () => this.generateWithFreeAI(prompts, useComicStyle, characterDialogue),
      () => this.generateWithHuggingFace(prompts, useComicStyle, characterDialogue)
    ];

    // Try each free service
    for (const service of freeServices) {
      try {
        console.log('Trying free AI service...');
        return await service();
      } catch (error) {
        console.warn('Free service failed, trying next:', error);
        continue;
      }
    }
    
    // Check if we have valid API keys for paid services
    const hasValidOpenAI = openaiKey && openaiKey !== 'your_openai_api_key_here';
    const hasValidGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
    
    // If no valid API keys for paid services, return demo
    if (!hasValidOpenAI && !hasValidGemini) {
      return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
    }
    
    // Prefer OpenAI for better reliability and quality
    if (hasValidOpenAI) {
      try {
        return await this.generateWithOpenAI(prompts, useComicStyle, characterDialogue);
      } catch (error) {
        console.warn('OpenAI story generation failed, trying Gemini fallback:', error);
        
        // If OpenAI fails and we have Gemini, try it
        if (hasValidGemini) {
          try {
            return await this.generateWithGemini(prompts, useComicStyle, characterDialogue);
          } catch (geminiError) {
            console.warn('Gemini fallback also failed, using demo:', geminiError);
            return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
          }
        }
        
        // No Gemini available, use demo
        return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
      }
    }
    
    // Only Gemini available
    if (hasValidGemini) {
      try {
        return await this.generateWithGemini(prompts, useComicStyle, characterDialogue);
      } catch (error) {
        console.warn('Gemini story generation failed, using demo:', error);
        return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
      }
    }
    
    // Final fallback
    return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
  }

  /**
   * Generate story using OpenAI
   */
  private async generateWithOpenAI(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
    }
    
    const systemPrompt = this.buildSystemPrompt(useComicStyle, characterDialogue);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
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
        return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
      }
      
      throw new Error(errorData.error?.message || 'Failed to generate story with OpenAI');
    }
    
    const data = await response.json();
    return {
      story: data.choices[0].message.content.trim(),
      metadata: {
        model: 'openai',
        generatedAt: new Date().toISOString(),
        tokenCount: data.usage?.total_tokens,
        style: useComicStyle ? 'comic' : 'narrative'
      }
    };
  }

  /**
   * Build system prompt based on style preferences
   */
  private buildSystemPrompt(useComicStyle: boolean, characterDialogue: boolean): string {
    let prompt = "You are a creative storyteller. ";
    
    if (useComicStyle) {
      prompt += "Write stories in a visual, comic book style with vivid descriptions and dynamic scenes. ";
    }
    
    if (characterDialogue) {
      prompt += "Include realistic character dialogue and interactions. ";
    }
    
    prompt += "Given a sequence of prompts, write a connected, engaging, and imaginative story that links all prompts as a narrative arc. Keep the story engaging and appropriate for all audiences. Return only the story text.";
    
    return prompt;
  }

  /**
   * Generate story using OpenRouter.ai (Free GPT-style models)
   */
  private async generateWithOpenRouter(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    try {
      // Try without API key first (some models are free)
      const systemPrompt = this.buildSystemPrompt(useComicStyle, characterDialogue);
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Dream Mint Verse'
      };
      
      if (apiKey && apiKey !== 'your_openrouter_api_key_here') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Use free models like MythoMax or Mistral
      const models = [
        'mythologies/mythomax-l2-13b',
        'mistralai/mistral-7b-instruct',
        'openchat/openchat-7b',
        'huggingfaceh4/zephyr-7b-beta'
      ];
      
      const model = models[Math.floor(Math.random() * models.length)];
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a story using these elements: ${prompts.join(', ')}` }
          ],
          max_tokens: 800,
          temperature: 0.8
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter failed: ${response.statusText}`);
      }

      const data = await response.json();
      const story = data.choices?.[0]?.message?.content?.trim() || '';
      
      return {
        story,
        metadata: {
          model: 'openrouter',
          generatedAt: new Date().toISOString(),
          style: useComicStyle ? 'comic' : 'narrative'
        }
      };
    } catch (error) {
      console.warn('OpenRouter story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story using KoboldAI
   */
  private async generateWithKoboldAI(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    try {
      // Try KoboldAI United endpoint (free community models)
      const prompt = `${this.buildSystemPrompt(useComicStyle, characterDialogue)}\n\nPrompts: ${prompts.join(', ')}\n\nStory:`;
      
      const response = await fetch('https://koboldai-united.herokuapp.com/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_length: 200,
          temperature: 0.8,
          top_p: 0.9,
          rep_pen: 1.1
        }),
      });

      if (!response.ok) {
        throw new Error(`KoboldAI failed: ${response.statusText}`);
      }

      const data = await response.json();
      const story = data.results?.[0]?.text?.trim() || '';
      
      return {
        story,
        metadata: {
          model: 'koboldai',
          generatedAt: new Date().toISOString(),
          style: useComicStyle ? 'comic' : 'narrative'
        }
      };
    } catch (error) {
      console.warn('KoboldAI story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story using HuggingFace Spaces (Free inference endpoints)
   */
  private async generateWithHuggingFaceSpaces(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    try {
      // Try various HuggingFace Spaces for text generation
      const spaces = [
        'https://huggingface.co/spaces/microsoft/DialoGPT-medium',
        'https://huggingface.co/spaces/facebook/blenderbot-400M-distill'
      ];
      
      const systemPrompt = this.buildSystemPrompt(useComicStyle, characterDialogue);
      const input = `${systemPrompt}\n\nCreate a story with: ${prompts.join(', ')}`;
      
      // Try the Inference API with various models
      const models = [
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill',
        'EleutherAI/gpt-neo-1.3B'
      ];
      
      for (const model of models) {
        try {
          const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inputs: input,
              parameters: {
                max_length: 300,
                temperature: 0.8,
                do_sample: true,
                top_p: 0.9
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            let story = '';
            
            if (Array.isArray(data)) {
              story = data[0]?.generated_text || data[0]?.text || '';
            } else {
              story = data.generated_text || data.text || '';
            }
            
            if (story && story.length > 10) {
              return {
                story: story.trim(),
                metadata: {
                  model: 'huggingface-spaces',
                  generatedAt: new Date().toISOString(),
                  style: useComicStyle ? 'comic' : 'narrative'
                }
              };
            }
          }
        } catch (modelError) {
          console.warn(`HuggingFace model ${model} failed:`, modelError);
          continue;
        }
      }
      
      throw new Error('All HuggingFace models failed');
    } catch (error) {
      console.warn('HuggingFace Spaces story generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate story using Gemini (updated with correct model name)
   */
  private async generateWithGemini(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.generateDemoStory(prompts, useComicStyle, characterDialogue);
    }
    
    const systemPrompt = this.buildSystemPrompt(useComicStyle, characterDialogue);
    
    // Try different available Gemini models
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];
    
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { 
                role: 'user', 
                parts: [{ 
                  text: `${systemPrompt}\n\nPrompts: ${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}` 
                }] 
              }
            ],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 800,
            }
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`Gemini model ${model} failed:`, errorData);
          
          // If this model is not found, try the next one
          if (errorData.error?.message?.includes('not found') || 
              errorData.error?.message?.includes('not supported')) {
            continue;
          }
          
          // For other errors, throw
          throw new Error(errorData.error?.message || `Failed to generate story with Gemini ${model}`);
        }
        
        const data = await response.json();
        
        // Check if we got a valid response
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          return {
            story: data.candidates[0].content.parts[0].text.trim(),
            metadata: {
              model: `gemini-${model}`,
              generatedAt: new Date().toISOString(),
              style: useComicStyle ? 'comic' : 'narrative'
            }
          };
        } else {
          console.warn(`Gemini model ${model} returned invalid response:`, data);
          continue;
        }
      } catch (error) {
        console.warn(`Gemini model ${model} failed:`, error);
        continue;
      }
    }
    
    // If all models failed, throw an error
    throw new Error('All Gemini models failed or are not available');
  }

  /**
   * Enhanced Free AI generation with better templates
   */
  private async generateWithFreeAI(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    try {
      const templates = useComicStyle ? this.getComicTemplates() : this.getNarrativeTemplates();
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Extract key elements from prompts
      const elements = prompts.length >= 5 ? prompts.slice(0, 5) : [...prompts, ...prompts, ...prompts].slice(0, 5);
      
      let story = template.opening.replace('{element1}', elements[0]).replace('{element2}', elements[1]);
      story += ' ' + template.middle.replace('{element3}', elements[2]);
      story += ' ' + template.climax.replace('{element4}', elements[3]);
      story += ' ' + template.resolution.replace('{element5}', elements[4]);

      if (characterDialogue) {
        story += this.addDialogue(elements);
      }

      // Add visual descriptions for comic style
      if (useComicStyle) {
        story += this.addVisualDescriptions();
      }
      
      return {
        story,
        metadata: {
          model: 'free-ai',
          generatedAt: new Date().toISOString(),
          style: useComicStyle ? 'comic' : 'narrative'
        }
      };
    } catch (error) {
      console.warn('Free AI story generation failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced Hugging Face generation
   */
  private async generateWithHuggingFace(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): Promise<StoryGenerationResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(useComicStyle, characterDialogue);
      const promptText = `${systemPrompt}\n\nCreate a story using: ${prompts.join(', ')}`;
      
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
      
      return {
        story: story.trim(),
        metadata: {
          model: 'huggingface',
          generatedAt: new Date().toISOString(),
          style: useComicStyle ? 'comic' : 'narrative'
        }
      };
    } catch (error) {
      console.warn('Hugging Face story generation failed:', error);
      throw error;
    }
  }

  /**
   * Get comic-style story templates
   */
  private getComicTemplates() {
    return [
      {
        opening: "PANEL 1: In a world where {element1} collides with {element2},",
        middle: "PANEL 2: Our hero discovers that {element3} holds the power",
        climax: "PANEL 3: to overcome {element4} in an epic showdown that",
        resolution: "PANEL 4: reveals the true nature of {element5}, changing everything!"
      },
      {
        opening: "SPLASH PAGE: When {element1} meets {element2},",
        middle: "SEQUENCE: an incredible journey through {element3} begins, where",
        climax: "CLIMAX SPREAD: the mystery of {element4} unfolds, and",
        resolution: "FINAL PANEL: {element5} becomes the key to victory!"
      }
    ];
  }

  /**
   * Get narrative story templates
   */
  private getNarrativeTemplates() {
    return [
      {
        opening: "In a realm where {element1} and {element2} intertwine,",
        middle: "our protagonist discovers that {element3} holds the secret to",
        climax: "overcoming the great challenge of {element4}, leading to",
        resolution: "a profound revelation about {element5} that transforms their world."
      },
      {
        opening: "The legend speaks of {element1} and {element2},",
        middle: "but when {element3} emerges in the tale,",
        climax: "everything changes as {element4} becomes the focal point, and",
        resolution: "the hidden power of {element5} brings hope to all."
      }
    ];
  }

  /**
   * Add dialogue to the story
   */
  private addDialogue(elements: string[]): string {
    const dialogues = [
      `\n\n"We must understand the connection between ${elements[0]} and ${elements[1]}," whispered the sage.`,
      `\n\n"The power of ${elements[2]} is beyond anything we've seen!" exclaimed the hero.`,
      `\n\n"But what if ${elements[3]} is not what it seems?" questioned the wise mentor.`
    ];
    
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }

  /**
   * Add visual descriptions for comic style
   */
  private addVisualDescriptions(): string {
    const descriptions = [
      "\n\nThe scene explodes with vibrant colors as magical energy swirls through the air.",
      "\n\nDramatic shadows fall across the landscape as our heroes stand determined.",
      "\n\nThe panel frames an epic moment frozen in time, full of motion and emotion.",
      "\n\nBurst effects and speed lines emphasize the intensity of the action."
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * Generate a demo story when API keys aren't available (updated)
   */
  private generateDemoStory(prompts: string[], useComicStyle: boolean = true, characterDialogue: boolean = false): StoryGenerationResult {
    const demoStories = useComicStyle ? [
      "PANEL 1: In a world where dreams and reality collide, our hero stands at the crossroads of destiny. PANEL 2: Through mystical portals and dimensional rifts, they discover ancient powers awakening. PANEL 3: Each challenge overcome reveals new mysteries in explosive detail. PANEL 4: The final revelation changes everything in a stunning climax!",
      
      "SPLASH PAGE: Once upon a time, in a realm beyond imagination, magic flows through every panel. SEQUENCE: The protagonist finds themselves center-stage in an ancient prophecy. CLIMAX SPREAD: With unlikely allies and powerful artifacts, they face their greatest challenge. FINAL PANEL: Victory brings hope to all!",
      
      "OPENING SHOT: In the heart of a bustling metropolis where technology meets wonder, an ordinary person discovers extraordinary abilities. MONTAGE: As they learn to harness their newfound powers, each panel reveals new adventures. EPIC FINALE: The hidden world of heroes welcomes its newest member!"
    ] : [
      "In a world where dreams and reality intertwine, our hero embarks on an extraordinary journey. Through mystical landscapes and challenging trials, they discover that the power to change their destiny lies within their own courage and determination. Each step forward reveals new mysteries, each challenge overcome brings them closer to understanding their true purpose.",
      
      "Once upon a time, in a realm beyond imagination, magic flowed through every corner of existence. The protagonist found themselves at the center of an ancient prophecy, tasked with restoring balance to a world on the brink of chaos. With unlikely allies and powerful artifacts, they must navigate treacherous paths and face their deepest fears.",
      
      "In the heart of a bustling metropolis, where technology and wonder coexist, an ordinary person discovers they possess extraordinary abilities. As they learn to harness their newfound powers, they uncover a hidden world of adventure, mystery, and purpose that will change their life forever."
    ];
    
    // Select a random demo story or create one based on prompts
    let story = demoStories[Math.floor(Math.random() * demoStories.length)];
    
    // If we have prompts, try to incorporate them
    if (prompts.length > 0) {
      const promptSummary = prompts.slice(0, 3).join(', ');
      const styleNote = useComicStyle ? ' (Comic Style)' : '';
      story = `[DEMO MODE${styleNote}] This is a sample story incorporating elements like: ${promptSummary}. ${story}`;
    } else {
      const styleNote = useComicStyle ? ' - Comic Style' : '';
      story = `[DEMO MODE${styleNote}] ${story}`;
    }

    if (characterDialogue) {
      story += '\n\n"This is just the beginning of our adventure!" declared the hero with determination.';
    }
    
    story += "\n\n✨ This is a demo story. Add valid API keys (OpenAI, Gemini, or OpenRouter) to generate custom stories based on your prompts.";
    
    return {
      story,
      metadata: {
        model: 'demo',
        generatedAt: new Date().toISOString(),
        style: useComicStyle ? 'comic' : 'narrative'
      }
    };
  }

  /**
   * Check available Gemini models (utility method for debugging)
   */
  async checkAvailableGeminiModels(): Promise<string[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return [];
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        console.warn('Failed to fetch Gemini models:', response.statusText);
        return [];
      }
      
      const data = await response.json();
      const models = data.models
        ?.filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
        ?.map((model: any) => model.name.replace('models/', '')) || [];
      
      console.log('Available Gemini models:', models);
      return models;
    } catch (error) {
      console.warn('Error checking Gemini models:', error);
      return [];
    }
  }
}

export const aiStoryService = AIStoryService.getInstance();
