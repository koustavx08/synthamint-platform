import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface APIStatusProps {
  className?: string;
}

export const APIStatus: React.FC<APIStatusProps> = ({ className = '' }) => {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const stabilityKey = import.meta.env.VITE_STABILITY_AI_API_KEY;
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const hasValidOpenAI = openaiKey && openaiKey !== 'your_openai_api_key_here';
  const hasValidGemini = geminiKey && geminiKey !== 'your_gemini_api_key_here';
  const hasValidStability = stabilityKey && stabilityKey !== 'your_stability_ai_api_key_here';

  const hasAnyValidKey = hasValidOpenAI || hasValidGemini || hasValidStability;

  if (hasAnyValidKey && !demoMode) {
    return null; // Don't show anything if APIs are properly configured
  }

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <AlertDescription className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">🚀 Demo Mode Active</span>
          <Badge variant="secondary">AI Features Limited</Badge>
        </div>
        
        <div className="text-sm text-gray-600">
          Currently showing demo content. To enable full AI features, add your API keys:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasValidOpenAI ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span>OpenAI {hasValidOpenAI ? '✓' : '✗'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasValidGemini ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span>Gemini {hasValidGemini ? '✓' : '✗'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasValidStability ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            <span>Stability AI {hasValidStability ? '✓' : '✗'}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          💡 <strong>Tip:</strong> Update your <code>.env</code> file with valid API keys to unlock real AI generation
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default APIStatus;
