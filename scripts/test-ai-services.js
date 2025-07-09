#!/usr/bin/env node

/**
 * AI Services Demo Script
 * Test all AI story generation services
 */

import { aiStoryService } from '../src/services/aiStoryService.js';

const DEMO_PROMPTS = [
  'A young hero discovers a magical sword',
  'An ancient dragon awakens from slumber', 
  'A epic battle determines the fate of the kingdom',
  'Unexpected allies join the final confrontation'
];

async function testService(serviceName, options) {
  console.log(`\n🧪 Testing ${serviceName}...`);
  console.log('─'.repeat(50));
  
  try {
    const startTime = Date.now();
    const result = await aiStoryService.generateStory(options);
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${serviceName} - Success (${duration}ms)`);
    console.log(`Model: ${result.metadata?.model || 'unknown'}`);
    console.log(`Style: ${result.metadata?.style || 'unknown'}`);
    console.log(`Generated: ${result.metadata?.generatedAt || 'unknown'}`);
    console.log('\n📖 Story Preview:');
    console.log(result.story.substring(0, 200) + '...');
    
    return { success: true, duration, result };
  } catch (error) {
    console.log(`❌ ${serviceName} - Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 AI Story Services Demo');
  console.log('=' .repeat(60));
  
  const results = {};

  // Test Auto mode (tries free services first)
  results.auto = await testService('Auto Mode', {
    prompts: DEMO_PROMPTS,
    model: 'auto',
    useComicStyle: true,
    characterDialogue: true
  });

  // Test specific free services
  results.openrouter = await testService('OpenRouter (Free GPT-style)', {
    prompts: DEMO_PROMPTS,
    model: 'openrouter',
    useComicStyle: true,
    characterDialogue: false
  });

  results.huggingface = await testService('HuggingFace Spaces', {
    prompts: DEMO_PROMPTS,
    model: 'huggingface-spaces',
    useComicStyle: false,
    characterDialogue: true
  });

  results.koboldai = await testService('KoboldAI Community', {
    prompts: DEMO_PROMPTS,
    model: 'koboldai',
    useComicStyle: true,
    characterDialogue: false
  });

  // Test premium services (if API keys available)
  if (process.env.VITE_OPENAI_API_KEY && process.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here') {
    results.openai = await testService('OpenAI GPT-4', {
      prompts: DEMO_PROMPTS,
      model: 'openai',
      useComicStyle: true,
      characterDialogue: true
    });
  }

  if (process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    results.gemini = await testService('Google Gemini', {
      prompts: DEMO_PROMPTS,
      model: 'gemini',
      useComicStyle: false,
      characterDialogue: true
    });
  }

  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(60));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  console.log('\n🏆 Performance Ranking:');
  const sortedResults = Object.entries(results)
    .filter(([_, result]) => result.success)
    .sort(([_, a], [__, b]) => a.duration - b.duration);
    
  sortedResults.forEach(([service, result], index) => {
    console.log(`${index + 1}. ${service} - ${result.duration}ms`);
  });

  console.log('\n💡 Recommendations:');
  if (results.auto?.success) {
    console.log('✅ Auto mode is working - recommended for most users');
  }
  
  const freeServices = ['openrouter', 'huggingface', 'koboldai'].filter(s => results[s]?.success);
  if (freeServices.length > 0) {
    console.log(`✅ Free services available: ${freeServices.join(', ')}`);
  }
  
  const premiumServices = ['openai', 'gemini'].filter(s => results[s]?.success);
  if (premiumServices.length > 0) {
    console.log(`💎 Premium services available: ${premiumServices.join(', ')}`);
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Add API keys to .env.local for premium services');
  console.log('2. Try different story styles and dialogue options');
  console.log('3. Integrate with comic image generation');
  console.log('4. Test with your own custom prompts');
}

// Style variation tests
async function testStyleVariations() {
  console.log('\n🎨 Style Variation Tests');
  console.log('=' .repeat(60));

  const basePrompts = ['Space explorer', 'Alien encounter', 'Diplomatic solution'];

  const variations = [
    { name: 'Comic Style + Dialogue', useComicStyle: true, characterDialogue: true },
    { name: 'Narrative Style + Dialogue', useComicStyle: false, characterDialogue: true },
    { name: 'Comic Style Only', useComicStyle: true, characterDialogue: false },
    { name: 'Pure Narrative', useComicStyle: false, characterDialogue: false }
  ];

  for (const variation of variations) {
    await testService(variation.name, {
      prompts: basePrompts,
      model: 'auto',
      useComicStyle: variation.useComicStyle,
      characterDialogue: variation.characterDialogue
    });
  }
}

// Load balancing test
async function testLoadBalancing() {
  console.log('\n⚖️ Load Balancing Test');
  console.log('=' .repeat(60));

  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      aiStoryService.generateStory({
        prompts: [`Test story ${i + 1}`, 'Quick generation', 'Simple plot'],
        model: 'auto',
        useComicStyle: true,
        characterDialogue: false
      })
    );
  }

  try {
    const results = await Promise.all(promises);
    console.log(`✅ Successfully generated ${results.length} stories concurrently`);
    
    const models = results.map(r => r.metadata?.model).filter(Boolean);
    const modelCounts = models.reduce((acc, model) => {
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});
    
    console.log('🔄 Model distribution:', modelCounts);
  } catch (error) {
    console.log(`❌ Concurrent generation failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('Starting comprehensive AI services test...\n');
  
  await runAllTests();
  await testStyleVariations();
  await testLoadBalancing();
  
  console.log('\n🎉 Demo completed!');
  console.log('Check the full documentation at docs/AI_SERVICES_GUIDE.md');
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testService, runAllTests, testStyleVariations, testLoadBalancing };
