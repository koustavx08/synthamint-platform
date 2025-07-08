// Environment configuration helper
// This file provides a centralized way to access environment variables

export interface AppConfig {
  // Application settings
  app: {
    name: string;
    url: string;
    description: string;
    environment: 'development' | 'staging' | 'production';
  };
  
  // Blockchain configuration
  blockchain: {
    network: 'fuji' | 'avalanche';
    contractAddress: string;
    rpcUrl?: string;
  };
  
  // IPFS configuration
  ipfs: {
    pinataApiKey?: string;
    pinataSecretKey?: string;
    pinataJwt?: string;
    gateway: string;
  };
  
  // AI services
  ai: {
    openaiApiKey?: string;
    stabilityApiKey?: string;
    midjourneyApiKey?: string;
  };
  
  // Collaboration
  collaboration: {
    socketUrl: string;
    roomExpiry: number;
    enabled: boolean;
  };
  
  // Analytics and monitoring
  analytics: {
    gaTrackingId?: string;
    mixpanelToken?: string;
    sentryDsn?: string;
  };
  
  // Feature flags
  features: {
    collaboration: boolean;
    batchMinting: boolean;
    royalties: boolean;
    marketplace: boolean;
    betaFeatures: boolean;
    aiEnhancement: boolean;
  };
  
  // Development settings
  development: {
    debugMode: boolean;
    mockMode: boolean;
    skipWalletCheck: boolean;
  };
}

// Get environment variable with fallback
const getEnvVar = (key: string, fallback?: string): string => {
  return import.meta.env[key] || fallback || '';
};

// Get boolean environment variable
const getBooleanEnv = (key: string, fallback: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

// Get number environment variable
const getNumberEnv = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  const num = parseInt(value, 10);
  return isNaN(num) ? fallback : num;
};

// Determine current environment
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const nodeEnv = import.meta.env.NODE_ENV;
  const viteMode = import.meta.env.MODE;
  
  if (nodeEnv === 'production' || viteMode === 'production') {
    return 'production';
  }
  if (viteMode === 'staging') {
    return 'staging';
  }
  return 'development';
};

// Get network configuration
const getNetworkConfig = () => {
  const environment = getEnvironment();
  const network = getEnvVar('VITE_NETWORK', environment === 'production' ? 'avalanche' : 'fuji') as 'fuji' | 'avalanche';
  
  const contractAddress = network === 'avalanche' 
    ? getEnvVar('VITE_CONTRACT_ADDRESS_MAINNET', '0x75123e5fF2efB0ECa8b8DaBE532c0f4844BBa439')
    : getEnvVar('VITE_CONTRACT_ADDRESS_FUJI', '0x75123e5fF2efB0ECa8b8DaBE532c0f4844BBa439');
  
  const rpcUrl = network === 'avalanche'
    ? getEnvVar('VITE_AVALANCHE_RPC_URL')
    : getEnvVar('VITE_FUJI_RPC_URL');
  
  return {
    network,
    contractAddress,
    rpcUrl: rpcUrl || undefined,
  };
};

// Get socket URL based on environment
const getSocketUrl = (): string => {
  const environment = getEnvironment();
  
  if (environment === 'production') {
    return getEnvVar('VITE_SOCKET_URL_PRODUCTION', 'wss://your-socketio-server.com');
  }
  
  return getEnvVar('VITE_SOCKET_URL_DEVELOPMENT', 'ws://localhost:3001');
};

// Main configuration object
export const appConfig: AppConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'SynthaMint'),
    url: getEnvVar('VITE_APP_URL', 'http://localhost:8080'),
    description: getEnvVar('VITE_APP_DESCRIPTION', 'AI-powered collaborative NFT minting platform'),
    environment: getEnvironment(),
  },
  
  blockchain: getNetworkConfig(),
  
  ipfs: {
    pinataApiKey: getEnvVar('VITE_PINATA_API_KEY'),
    pinataSecretKey: getEnvVar('VITE_PINATA_SECRET_KEY'),
    pinataJwt: getEnvVar('VITE_PINATA_JWT'),
    gateway: getEnvVar('VITE_IPFS_GATEWAY', 'https://gateway.pinata.cloud/ipfs/'),
  },
  
  ai: {
    openaiApiKey: getEnvVar('VITE_OPENAI_API_KEY'),
    stabilityApiKey: getEnvVar('VITE_STABILITY_AI_API_KEY'),
    midjourneyApiKey: getEnvVar('VITE_MIDJOURNEY_API_KEY'),
  },
  
  collaboration: {
    socketUrl: getSocketUrl(),
    roomExpiry: getNumberEnv('VITE_COLLAB_ROOM_EXPIRY', 60),
    enabled: getBooleanEnv('VITE_ENABLE_COLLABORATION', true),
  },
  
  analytics: {
    gaTrackingId: getEnvVar('VITE_GA_TRACKING_ID'),
    mixpanelToken: getEnvVar('VITE_MIXPANEL_TOKEN'),
    sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  },
  
  features: {
    collaboration: getBooleanEnv('VITE_ENABLE_COLLABORATION', true),
    batchMinting: getBooleanEnv('VITE_ENABLE_BATCH_MINTING', false),
    royalties: getBooleanEnv('VITE_ENABLE_ROYALTIES', true),
    marketplace: getBooleanEnv('VITE_ENABLE_MARKETPLACE', false),
    betaFeatures: getBooleanEnv('VITE_ENABLE_BETA_FEATURES', false),
    aiEnhancement: getBooleanEnv('VITE_ENABLE_AI_ENHANCEMENT', true),
  },
  
  development: {
    debugMode: getBooleanEnv('VITE_DEBUG_MODE', false),
    mockMode: getBooleanEnv('VITE_MOCK_MODE', false),
    skipWalletCheck: getBooleanEnv('VITE_SKIP_WALLET_CHECK', false),
  },
};

// Utility functions for checking environment
export const isDevelopment = () => appConfig.app.environment === 'development';
export const isStaging = () => appConfig.app.environment === 'staging';
export const isProduction = () => appConfig.app.environment === 'production';

// Validation function to check if required env vars are set
export const validateConfig = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = [
    'VITE_PINATA_API_KEY',
    'VITE_PINATA_SECRET_KEY',
  ];
  
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  // Additional validation for production
  if (isProduction()) {
    const productionRequiredVars = [
      'VITE_APP_URL',
      'VITE_CONTRACT_ADDRESS_MAINNET',
    ];
    
    productionRequiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        missingVars.push(varName);
      }
    });
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};

// Log configuration on app start (only in development)
if (isDevelopment() && appConfig.development.debugMode) {
  console.log('🔧 App Configuration:', {
    environment: appConfig.app.environment,
    network: appConfig.blockchain.network,
    contractAddress: appConfig.blockchain.contractAddress,
    features: appConfig.features,
  });
  
  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('⚠️ Missing environment variables:', validation.missingVars);
  }
}

export default appConfig;
