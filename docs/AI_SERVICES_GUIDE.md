# 🧠 Enhanced AI Services Guide

The Dream Mint Verse now supports multiple AI providers for story generation, including both free and premium options. This guide explains how to set up and use each service.

## 🆓 Free AI Services (No API Keys Required)

### 1. OpenRouter.ai
**Best for**: High-quality story generation with GPT-style models
- **Models**: MythoMax, Mistral-7B, OpenChat, Zephyr-7B
- **Setup**: Works without API key for community models
- **Quality**: ⭐⭐⭐⭐⭐
- **Rate Limits**: Generous community limits

### 2. HuggingFace Spaces
**Best for**: Diverse model selection and fine-tuned storytelling
- **Models**: DialoGPT, BlenderBot, GPT-Neo
- **Setup**: No API key required
- **Quality**: ⭐⭐⭐⭐
- **Rate Limits**: Variable based on model load

### 3. KoboldAI United
**Best for**: Creative storytelling and character dialogue
- **Models**: Community-hosted models
- **Setup**: No API key required
- **Quality**: ⭐⭐⭐
- **Rate Limits**: Community dependent

### 4. Built-in Template System
**Best for**: Always-available fallback
- **Features**: Smart template system with prompt incorporation
- **Setup**: Always works
- **Quality**: ⭐⭐
- **Rate Limits**: None

## 💎 Premium AI Services (API Keys Required)

### 1. OpenAI (GPT-4)
**Best for**: Highest quality and most coherent stories
- **Model**: GPT-4o
- **Cost**: ~$0.01-0.03 per story
- **Quality**: ⭐⭐⭐⭐⭐
- **Setup**: Get API key from [OpenAI](https://platform.openai.com/api-keys)

### 2. Google Gemini
**Best for**: Creative and diverse storytelling
- **Model**: Gemini Pro
- **Cost**: Free tier available, then paid
- **Quality**: ⭐⭐⭐⭐⭐
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🎨 New Features

### Comic Book Style Generation
- **Panel-based storytelling**: Stories formatted as comic panels
- **Visual descriptions**: Enhanced with comic-style visual elements
- **Layout support**: Optimized for comic book layouts

### Character Dialogue
- **Realistic conversations**: Natural character interactions
- **Quote formatting**: Properly formatted dialogue
- **Character development**: Enhanced personality in conversations

### Auto-Selection
- **Smart fallback**: Automatically tries free services first
- **Quality prioritization**: Falls back to premium when needed
- **Error handling**: Graceful degradation to demo mode

## 🛠️ Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and add your API keys:

```bash
# === FREE SERVICES (Optional API keys for better limits) ===
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# === PREMIUM SERVICES ===
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# === FREE SERVICE CONTROLS ===
VITE_ENABLE_FREE_AI=true
VITE_ENABLE_HUGGINGFACE=true
VITE_ENABLE_KOBOLDAI=true
```

### 2. Getting API Keys

#### OpenRouter (Recommended Free Option)
1. Visit [OpenRouter.ai](https://openrouter.ai/keys)
2. Sign up for free account
3. Generate API key
4. Some models are completely free!

#### OpenAI (Premium)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account and add billing
3. Generate API key
4. Monitor usage to control costs

#### Google Gemini (Premium with Free Tier)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Generate API key
4. Free tier includes generous limits

## 🎯 Usage Guide

### Auto Mode (Recommended)
```typescript
const result = await aiStoryService.generateStory({
  prompts: ['Hero discovers magic', 'Dragon appears', 'Epic battle'],
  model: 'auto', // Tries free services first
  useComicStyle: true,
  characterDialogue: true
});
```

### Specific Model
```typescript
const result = await aiStoryService.generateStory({
  prompts: ['Space adventure', 'Alien encounter', 'Peace treaty'],
  model: 'openrouter', // Use specific service
  useComicStyle: false,
  characterDialogue: true
});
```

## 📊 Service Comparison

| Service | Cost | Quality | Speed | Reliability |
|---------|------|---------|-------|-------------|
| OpenRouter | Free* | ⭐⭐⭐⭐⭐ | Fast | High |
| HuggingFace | Free | ⭐⭐⭐⭐ | Variable | Medium |
| KoboldAI | Free | ⭐⭐⭐ | Medium | Medium |
| OpenAI | Paid | ⭐⭐⭐⭐⭐ | Fast | Very High |
| Gemini | Freemium | ⭐⭐⭐⭐⭐ | Fast | High |
| Built-in | Free | ⭐⭐ | Instant | Perfect |

*Some OpenRouter models are free, others require credits

## 🚀 Advanced Features

### Metadata Tracking
Every generated story includes metadata:
```typescript
{
  story: "Your generated story...",
  metadata: {
    model: "openrouter",
    generatedAt: "2025-07-09T12:00:00Z",
    style: "comic",
    tokenCount: 245
  }
}
```

### Error Handling
- **Graceful fallbacks**: Automatically tries alternatives
- **User feedback**: Clear error messages
- **Demo mode**: Always works as final fallback

### Rate Limiting
- **Built-in delays**: Prevents API rate limiting
- **Queue management**: Handles multiple requests
- **Cost optimization**: Prioritizes free services

## 🎨 Image Generation Integration

### Leonardo.ai (Coming Soon)
- Comic-style image generation
- Character consistency
- Panel-specific art styles

### Playground AI (Coming Soon)
- Free monthly images
- Commercial usage rights
- Style templates

### Replicate + ControlNet (Coming Soon)
- Advanced panel generation
- Pose and layout control
- Custom comic styles

## 📝 Best Practices

### 1. Prompt Writing
- **Be specific**: "A wizard casting lightning spell" vs "magic"
- **Include context**: Setting, characters, mood
- **Sequential flow**: Each prompt should connect to the next

### 2. Cost Management
- Use **Auto mode** to maximize free usage
- Set up **rate limiting** for premium APIs
- Monitor usage in provider dashboards

### 3. Quality Optimization
- **Comic style** works best for visual stories
- **Character dialogue** enhances engagement
- **3-6 prompts** provide optimal story length

## 🔧 Troubleshooting

### Common Issues

**"API key invalid"**
- Check key format and permissions
- Verify billing status for premium services
- Try regenerating the key

**"Service unavailable"**
- Free services may have temporary limits
- Try alternative service or wait
- Check service status pages

**"Poor story quality"**
- Use more specific prompts
- Enable comic style and dialogue
- Try premium services for better results

### Getting Help

1. Check the console for detailed error messages
2. Verify API keys in `.env.local`
3. Test with demo mode first
4. Check service status pages
5. Join our Discord for community support

## 🌟 Future Enhancements

- **Real-time collaboration** on story generation
- **Custom model fine-tuning** for your style
- **Multi-language support** for global creators
- **Advanced comic layouts** with ControlNet
- **Voice narration** integration
- **Animated panel transitions**

---

**Happy storytelling!** 🎭✨
