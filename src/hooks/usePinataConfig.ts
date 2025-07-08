import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePinataConfig = () => {
  const [pinataApiKey, setPinataApiKey] = useState('');
  const [pinataSecretKey, setPinataSecretKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedApiKey = localStorage.getItem('pinata_api_key');
    const savedSecretKey = localStorage.getItem('pinata_secret_key');
    if (savedApiKey) setPinataApiKey(savedApiKey);
    if (savedSecretKey) setPinataSecretKey(savedSecretKey);
  }, []);

  const saveConfig = (apiKey: string, secretKey: string) => {
    setPinataApiKey(apiKey);
    setPinataSecretKey(secretKey);
    localStorage.setItem('pinata_api_key', apiKey);
    localStorage.setItem('pinata_secret_key', secretKey);
    toast({
      title: "Configuration Saved",
      description: "Your Pinata API credentials have been saved locally.",
    });
  };

  const hasCredentials = !!(pinataApiKey && pinataSecretKey);

  return {
    pinataApiKey,
    pinataSecretKey,
    hasCredentials,
    saveConfig,
  };
};
