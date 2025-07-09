export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  n?: number;
  collaborativePrompts?: string[];
  blendingStrategy?: 'merge' | 'fusion' | 'style-transfer' | 'weighted';
  weights?: number[];
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
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file');
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
    if (!apiKey || apiKey === 'your_stability_ai_api_key_here') {
      throw new Error('Stability AI API key not configured. Please add VITE_STABILITY_AI_API_KEY to your .env file');
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
   * Advanced prompt blending for collaborative art generation
   */
  blendPrompts(prompts: string[], strategy: 'merge' | 'fusion' | 'style-transfer' | 'weighted' = 'fusion', weights?: number[]): string {
    if (prompts.length === 0) return '';
    if (prompts.length === 1) return prompts[0];

    switch (strategy) {
      case 'merge':
        // Simple concatenation with connectors
        return prompts.join(', combined with ');

      case 'fusion':
        // Advanced fusion with style mixing
        const [prompt1, prompt2] = prompts;
        return `A masterful fusion of (${prompt1}) seamlessly blended with (${prompt2}), creating a harmonious artistic synthesis that combines the best elements of both visions, professional digital art, highly detailed, cinematic lighting`;

      case 'style-transfer':
        // Use first prompt as content, others as style
        const [content, ...styles] = prompts;
        return `${content} rendered in the artistic style of: ${styles.join(' mixed with ')}, professional artwork, detailed, vibrant`;

      case 'weighted':
        // Weighted combination using attention mechanisms
        if (weights && weights.length === prompts.length) {
          const weightedPrompts = prompts.map((prompt, i) => {
            const weight = weights[i];
            if (weight > 0.7) return `((${prompt}))`;
            if (weight > 0.5) return `(${prompt})`;
            if (weight > 0.3) return prompt;
            return `[${prompt}]`;
          });
          return weightedPrompts.join(' ');
        }
        // Fall back to fusion if weights not provided
        return this.blendPrompts(prompts, 'fusion');

      default:
        return prompts.join(', ');
    }
  }

  /**
   * Generate collaborative image with advanced prompt blending
   */
  async generateCollaborativeImage(
    prompt1: string, 
    prompt2: string, 
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<ImageGenerationResult> {
    const blendingStrategy = options.blendingStrategy || 'fusion';
    const weights = options.weights || [0.5, 0.5];
    
    const blendedPrompt = this.blendPrompts([prompt1, prompt2], blendingStrategy, weights);
    
    const enhancedOptions: ImageGenerationOptions = {
      ...options,
      prompt: blendedPrompt,
      style: options.style || 'vivid',
      quality: options.quality || 'hd'
    };

    return this.generateImage(enhancedOptions);
  }

  /**
   * Generate an image using Replicate's SDXL with advanced features
   */
  async generateWithReplicate(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const apiKey = import.meta.env.VITE_REPLICATE_API_KEY;
    if (!apiKey) {
      throw new Error('Replicate API key not configured');
    }

    try {
      // Start the prediction
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
          input: {
            prompt: options.prompt,
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            prompt_strength: 0.8,
            refine: "expert_ensemble_refiner",
            high_noise_frac: 0.8
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start prediction');
      }

      const prediction = await response.json();
      
      // Poll for completion
      let result = prediction;
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        });
        
        result = await pollResponse.json();
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Image generation failed');
      }

      return {
        url: result.output[0],
        revisedPrompt: options.prompt
      };
    } catch (error) {
      console.error('Replicate generation error:', error);
      throw error;
    }
  }
  /**
   * Auto-select the best available AI service and generate an image
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const replicateKey = import.meta.env.VITE_REPLICATE_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const stabilityKey = import.meta.env.VITE_STABILITY_AI_API_KEY;

    // Prefer Replicate for collaborative features (best for prompt blending)
    if (replicateKey && options.collaborativePrompts) {
      try {
        return await this.generateWithReplicate(options);
      } catch (error) {
        console.warn('Replicate generation failed, trying fallback:', error);
      }
    }

    // Try OpenAI for single prompts if available
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

    throw new Error('No AI image generation service is configured. Please add API keys for Replicate, OpenAI, or Stability AI.');
  }

  /**
   * Get available AI services
   */
  getAvailableServices(): string[] {
    const services: string[] = [];
    
    if (import.meta.env.VITE_REPLICATE_API_KEY) {
      services.push('Replicate SDXL');
    }
    
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
