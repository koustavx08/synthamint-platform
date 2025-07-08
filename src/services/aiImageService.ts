export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
}

export interface ImageGenerationResult {
  url: string;
  revisedPrompt?: string;
}

export class AIImageService {
  private static instance: AIImageService;
  
  public static getInstance(): AIImageService {
    if (!AIImageService.instance) {
      AIImageService.instance = new AIImageService();
    }
    return AIImageService.instance;
  }

  /**
   * Generate an image using OpenAI DALL-E
   */
  async generateWithOpenAI(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || "dall-e-3",
        prompt: options.prompt,
        n: options.n || 1,
        size: options.size || "1024x1024",
        quality: options.quality || "standard",
        style: options.style || "vivid"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate image with OpenAI');
    }

    const data = await response.json();
    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt
    };
  }

  /**
   * Generate an image using Stability AI
   */
  async generateWithStabilityAI(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const apiKey = import.meta.env.VITE_STABILITY_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Stability AI API key not configured');
    }

    const engineId = options.model || 'stable-diffusion-v1-6';
    
    const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: options.prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate image with Stability AI');
    }

    const data = await response.json();
    
    // Convert base64 to blob URL
    const base64Image = data.artifacts[0].base64;
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    return { url };
  }

  /**
   * Auto-select the best available AI service and generate an image
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const stabilityKey = import.meta.env.VITE_STABILITY_AI_API_KEY;

    // Try OpenAI first if available
    if (openaiKey) {
      try {
        return await this.generateWithOpenAI(options);
      } catch (error) {
        console.warn('OpenAI generation failed, trying fallback:', error);
      }
    }

    // Fallback to Stability AI
    if (stabilityKey) {
      try {
        return await this.generateWithStabilityAI(options);
      } catch (error) {
        console.warn('Stability AI generation failed:', error);
        throw error;
      }
    }

    throw new Error('No AI image generation service is configured. Please add API keys for OpenAI or Stability AI.');
  }

  /**
   * Get available AI services
   */
  getAvailableServices(): string[] {
    const services: string[] = [];
    
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      services.push('OpenAI DALL-E');
    }
    
    if (import.meta.env.VITE_STABILITY_AI_API_KEY) {
      services.push('Stability AI');
    }

    return services;
  }

  /**
   * Validate prompt for AI generation
   */
  validatePrompt(prompt: string): { isValid: boolean; message?: string } {
    if (!prompt.trim()) {
      return { isValid: false, message: 'Prompt cannot be empty' };
    }

    if (prompt.length < 3) {
      return { isValid: false, message: 'Prompt must be at least 3 characters long' };
    }

    if (prompt.length > 4000) {
      return { isValid: false, message: 'Prompt is too long (max 4000 characters)' };
    }

    // Check for potentially problematic content
    const prohibitedTerms = ['nsfw', 'nude', 'explicit', 'violence', 'gore'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const term of prohibitedTerms) {
      if (lowerPrompt.includes(term)) {
        return { isValid: false, message: 'Prompt contains prohibited content' };
      }
    }

    return { isValid: true };
  }
}

export const aiImageService = AIImageService.getInstance();
