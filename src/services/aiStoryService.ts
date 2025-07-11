export interface StoryGenerationOptions {
  prompts: string[];
  model?: 'auto' | 'custom';
  customModelId?: string;
  useComicStyle?: boolean;
  characterDialogue?: boolean;
  maxLength?: number;
  temperature?: number;
}

export interface StoryGenerationResult {
  story: string;
  metadata?: {
    model: string;
    modelId?: string;
    generatedAt: string;
    tokenCount?: number;
    style?: string;
    temperature?: number;
    processingTime?: number;
  };
}

export class AIStoryService {
  private static instance: AIStoryService;
  private readonly apiKey: string | null;
  private readonly apiUrl = 'https://api-inference.huggingface.co/models';
  
  // High-quality story generation models in order of preference
  private readonly storyModels = [
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-1B-distill',
    'microsoft/DialoGPT-medium',
    'facebook/blenderbot-400M-distill',
    'EleutherAI/gpt-neo-2.7B',
    'EleutherAI/gpt-neo-1.3B',
    'EleutherAI/gpt-j-6B',
    'bigscience/bloom-560m',
    'gpt2-large',
    'gpt2-medium'
  ];

  // Comic-specific models that work well for visual storytelling
  private readonly comicModels = [
    'EleutherAI/gpt-neo-2.7B',
    'EleutherAI/gpt-j-6B',
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-1B-distill'
  ];

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || null;
  }

  public static getInstance(): AIStoryService {
    if (!AIStoryService.instance) {
      AIStoryService.instance = new AIStoryService();
    }
    return AIStoryService.instance;
  }

  async generateStory(options: StoryGenerationOptions): Promise<StoryGenerationResult> {
    const { 
      prompts, 
      model = 'auto', 
      customModelId,
      useComicStyle = true, 
      characterDialogue = false,
      maxLength = 800,
      temperature = 0.8
    } = options;

    const startTime = Date.now();
    
    try {
      let result: StoryGenerationResult;

      if (model === 'custom' && customModelId) {
        result = await this.generateWithCustomModel(
          customModelId, 
          prompts, 
          useComicStyle, 
          characterDialogue, 
          maxLength, 
          temperature
        );
      } else {
        result = await this.generateWithBestModel(
          prompts, 
          useComicStyle, 
          characterDialogue, 
          maxLength, 
          temperature
        );
      }

      // Add processing time to metadata
      if (result.metadata) {
        result.metadata.processingTime = Date.now() - startTime;
      }

      return result;
    } catch (error) {
      console.warn('Story generation failed, falling back to enhanced demo:', error);
      return this.generateEnhancedDemoStory(prompts, useComicStyle, characterDialogue);
    }
  }

  /**
   * Generate story using the best available Hugging Face model
   */
  private async generateWithBestModel(
    prompts: string[], 
    useComicStyle: boolean, 
    characterDialogue: boolean,
    maxLength: number,
    temperature: number
  ): Promise<StoryGenerationResult> {
    const modelList = useComicStyle ? this.comicModels : this.storyModels;
    
    for (const modelId of modelList) {
      try {
        console.log(`Trying Hugging Face model: ${modelId}`);
        const result = await this.generateWithHuggingFaceModel(
          modelId, 
          prompts, 
          useComicStyle, 
          characterDialogue, 
          maxLength, 
          temperature
        );
        
        if (result.story && result.story.length > 50) {
          return result;
        }
      } catch (error) {
        console.warn(`Model ${modelId} failed, trying next:`, error);
        continue;
      }
    }
    
    throw new Error('All Hugging Face models failed');
  }

  /**
   * Generate story using a custom Hugging Face model
   */
  private async generateWithCustomModel(
    modelId: string,
    prompts: string[], 
    useComicStyle: boolean, 
    characterDialogue: boolean,
    maxLength: number,
    temperature: number
  ): Promise<StoryGenerationResult> {
    return this.generateWithHuggingFaceModel(
      modelId, 
      prompts, 
      useComicStyle, 
      characterDialogue, 
      maxLength, 
      temperature
    );
  }

  /**
   * Generate story using a specific Hugging Face model
   */
  private async generateWithHuggingFaceModel(
    modelId: string,
    prompts: string[], 
    useComicStyle: boolean, 
    characterDialogue: boolean,
    maxLength: number,
    temperature: number
  ): Promise<StoryGenerationResult> {
    const systemPrompt = this.buildEnhancedSystemPrompt(useComicStyle, characterDialogue);
    const storyPrompt = this.buildStoryPrompt(prompts, useComicStyle);
    const fullPrompt = `${systemPrompt}\n\n${storyPrompt}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const requestBody = {
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: maxLength,
        temperature: temperature,
        do_sample: true,
        top_p: 0.95,
        top_k: 50,
        repetition_penalty: 1.1,
        length_penalty: 1.0,
        early_stopping: true,
        return_full_text: false
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    };

    const response = await fetch(`${this.apiUrl}/${modelId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error for model ${modelId}: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let story = '';
    if (Array.isArray(data)) {
      story = data[0]?.generated_text || data[0]?.text || '';
    } else if (data.generated_text) {
      story = data.generated_text;
    } else if (data.text) {
      story = data.text;
    } else if (typeof data === 'string') {
      story = data;
    }

    if (!story || story.length < 10) {
      throw new Error(`Model ${modelId} returned insufficient content`);
    }

    // Clean up the story
    story = this.cleanAndEnhanceStory(story, useComicStyle, characterDialogue);

    return {
      story,
      metadata: {
        model: 'huggingface',
        modelId,
        generatedAt: new Date().toISOString(),
        style: useComicStyle ? 'comic' : 'narrative',
        temperature,
        tokenCount: story.split(' ').length
      }
    };
  }

  /**
   * Build enhanced system prompt for better story generation
   */
  private buildEnhancedSystemPrompt(useComicStyle: boolean, characterDialogue: boolean): string {
    let prompt = "You are a master storyteller specializing in creative, engaging narratives. ";
    
    if (useComicStyle) {
      prompt += `Create visual, comic book-style stories with:
- Panel descriptions (PANEL 1:, PANEL 2:, etc.)
- Dynamic action sequences
- Vivid visual descriptions
- Dramatic scene transitions
- Speech bubbles and sound effects
- Epic splash pages and climactic spreads
`;
    } else {
      prompt += "Write flowing, narrative-style stories with rich descriptions and engaging plot development. ";
    }
    
    if (characterDialogue) {
      prompt += "Include authentic character dialogue, emotional depth, and meaningful interactions between characters. ";
    }
    
    prompt += `
IMPORTANT GUIDELINES:
- Create a complete, coherent story arc
- Connect all given elements naturally
- Keep content appropriate for all audiences
- Make the story engaging and memorable
- Use creative transitions between scenes
- End with a satisfying conclusion

STORY ELEMENTS TO INCORPORATE:`;
    
    return prompt;
  }

  /**
   * Build story prompt from user inputs
   */
  private buildStoryPrompt(prompts: string[], useComicStyle: boolean): string {
    const elements = prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n');
    
    const styleNote = useComicStyle ? 
      "\n\nFormat as a comic book story with panel descriptions." : 
      "\n\nFormat as a flowing narrative story.";
    
    return `${elements}${styleNote}\n\nStory:`;
  }

  /**
   * Clean and enhance generated story
   */
  private cleanAndEnhanceStory(story: string, useComicStyle: boolean, characterDialogue: boolean): string {
    // Remove any prompt text that might have been included
    let cleanStory = story.replace(/^.*?Story:\s*/i, '');
    
    // Remove repetitive patterns
    cleanStory = cleanStory.replace(/(.{10,}?)\1+/g, '$1');
    
    // Enhance comic style formatting
    if (useComicStyle) {
      cleanStory = this.enhanceComicFormatting(cleanStory);
    }
    
    // Add dialogue if requested and missing
    if (characterDialogue && !cleanStory.includes('"')) {
      cleanStory = this.addDialogueElements(cleanStory);
    }
    
    // Ensure proper ending
    if (!cleanStory.match(/[.!?]$/)) {
      cleanStory += '.';
    }
    
    return cleanStory.trim();
  }

  /**
   * Enhance comic book formatting
   */
  private enhanceComicFormatting(story: string): string {
    // Add panel markers if missing
    if (!story.includes('PANEL')) {
      const sentences = story.split(/[.!?]+/).filter(s => s.trim());
      const panels = [];
      
      for (let i = 0; i < Math.min(sentences.length, 6); i++) {
        const panelType = i === 0 ? 'SPLASH PAGE' : 
                         i === sentences.length - 1 ? 'FINAL PANEL' :
                         i === Math.floor(sentences.length / 2) ? 'DRAMATIC SPREAD' :
                         `PANEL ${i + 1}`;
        panels.push(`${panelType}: ${sentences[i].trim()}.`);
      }
      
      story = panels.join('\n\n');
    }
    
    // Add visual effects
    const effects = [
      'BAM!', 'POW!', 'WHOOSH!', '*FLASH*', '*BOOM*', 
      'CRASH!', 'ZAP!', '*SPARKLE*', 'SWOOSH!'
    ];
    
    // Occasionally add sound effects
    if (Math.random() > 0.7) {
      const effect = effects[Math.floor(Math.random() * effects.length)];
      story += `\n\n*${effect}*`;
    }
    
    return story;
  }

  /**
   * Add dialogue elements to story
   */
  private addDialogueElements(story: string): string {
    const dialoguePhrases = [
      '"This is incredible!"',
      '"We must work together to overcome this challenge."',
      '"The power within us is stronger than any obstacle."',
      '"I believe in our mission."',
      '"Together, we can achieve anything."'
    ];
    
    const dialogue = dialoguePhrases[Math.floor(Math.random() * dialoguePhrases.length)];
    return `${story}\n\n${dialogue} declared the hero with unwavering determination.`;
  }

  /**
   * Generate enhanced demo story when API is unavailable
   */
  private generateEnhancedDemoStory(
    prompts: string[], 
    useComicStyle: boolean, 
    characterDialogue: boolean
  ): StoryGenerationResult {
    const templates = this.getEnhancedTemplates(useComicStyle);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Use prompts to customize the story
    const elements = this.extractStoryElements(prompts);
    
    let story = template.opening.replace(/{(\w+)}/g, (match, key) => elements[key] || 'adventure');
    story += '\n\n' + template.middle.replace(/{(\w+)}/g, (match, key) => elements[key] || 'mystery');
    story += '\n\n' + template.climax.replace(/{(\w+)}/g, (match, key) => elements[key] || 'challenge');
    story += '\n\n' + template.resolution.replace(/{(\w+)}/g, (match, key) => elements[key] || 'victory');

    if (characterDialogue) {
      story += '\n\n"This is just the beginning of our epic journey!" proclaimed the hero with determination.';
    }

    if (useComicStyle) {
      story = this.enhanceComicFormatting(story);
    }
    
    const styleNote = useComicStyle ? ' - Comic Style' : '';
    story = `[DEMO MODE${styleNote}] ${story}\n\n✨ Add your Hugging Face API key to unlock AI-powered story generation with custom models!`;
    
    return {
      story,
      metadata: {
        model: 'demo',
        generatedAt: new Date().toISOString(),
        style: useComicStyle ? 'comic' : 'narrative',
        temperature: 0.8
      }
    };
  }

  /**
   * Extract story elements from prompts
   */
  private extractStoryElements(prompts: string[]): Record<string, string> {
    const elements: Record<string, string> = {};
    
    prompts.forEach((prompt, index) => {
      elements[`element${index + 1}`] = prompt;
      elements[`prompt${index + 1}`] = prompt;
    });
    
    // Add some defaults
    elements.hero = elements.element1 || 'brave adventurer';
    elements.challenge = elements.element2 || 'mysterious quest';
    elements.power = elements.element3 || 'hidden strength';
    elements.villain = elements.element4 || 'dark force';
    elements.treasure = elements.element5 || 'ancient artifact';
    
    return elements;
  }

  /**
   * Get enhanced story templates
   */
  private getEnhancedTemplates(useComicStyle: boolean) {
    if (useComicStyle) {
      return [
        {
          opening: "SPLASH PAGE: In a world where {hero} discovers {challenge}",
          middle: "SEQUENCE: The journey through {power} reveals hidden truths",
          climax: "EPIC SPREAD: Facing {villain} in the ultimate confrontation",
          resolution: "FINAL PANEL: {treasure} brings peace and new beginnings"
        },
        {
          opening: "PANEL 1: When {hero} encounters {challenge}",
          middle: "PANEL 2-3: Unlocking {power} through determination",
          climax: "DRAMATIC DOUBLE-PAGE: The battle against {villain} reaches its peak",
          resolution: "CLOSING PANEL: {treasure} illuminates the path forward"
        }
      ];
    } else {
      return [
        {
          opening: "In a realm where {hero} first encounters {challenge}",
          middle: "the discovery of {power} changes everything",
          climax: "leading to an epic confrontation with {villain}",
          resolution: "and the revelation that {treasure} holds the key to peace"
        },
        {
          opening: "Legend tells of {hero} who sought {challenge}",
          middle: "through trials that awakened {power} within",
          climax: "culminating in a decisive battle against {villain}",
          resolution: "where {treasure} emerged as the source of hope"
        }
      ];
    }
  }

  /**
   * Get available Hugging Face models for stories
   */
  getAvailableModels(): { story: string[], comic: string[] } {
    return {
      story: [...this.storyModels],
      comic: [...this.comicModels]
    };
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_huggingface_api_key_here';
  }

  /**
   * Test model availability
   */
  async testModel(modelId: string): Promise<boolean> {
    try {
      const result = await this.generateWithHuggingFaceModel(
        modelId,
        ['test story'],
        false,
        false,
        100,
        0.7
      );
      return !!result.story && result.story.length > 10;
    } catch (error) {
      console.warn(`Model ${modelId} test failed:`, error);
      return false;
    }
  }
}

export const aiStoryService = AIStoryService.getInstance();
