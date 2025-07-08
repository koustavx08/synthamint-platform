
import { useState } from 'react';
import { usePinataConfig } from '@/hooks/usePinataConfig';
import { useNFTMinting } from '@/hooks/useNFTMinting';
import IPFSConfigModal from './IPFSConfigModal';
import MintSuccessDisplay from './MintSuccessDisplay';
import NFTMinterHeader from './NFTMinterHeader';
import IPFSConfigWarning from './IPFSConfigWarning';
import NFTMetadataForm from './NFTMetadataForm';
import MintButton from './MintButton';
import TransactionHash from './TransactionHash';

interface NFTMinterProps {
  imageUrl: string;
  prompt: string;
}

const NFTMinter = ({ imageUrl, prompt }: NFTMinterProps) => {
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  
  const { pinataApiKey, pinataSecretKey, hasCredentials, saveConfig } = usePinataConfig();
  
  const {
    mintNFT,
    isLoading,
    isUploading,
    isPending,
    isSuccess,
    hash,
  } = useNFTMinting({
    imageUrl,
    prompt,
    pinataApiKey,
    pinataSecretKey,
    nftName,
    nftDescription,
    onConfigRequired: () => setShowConfigModal(true),
  });

  if (isSuccess) {
    return <MintSuccessDisplay />;
  }

  return (
    <>
      <div className="space-y-4">
        <NFTMinterHeader
          hasCredentials={hasCredentials}
          onConfigClick={() => setShowConfigModal(true)}
        />

        <IPFSConfigWarning hasCredentials={hasCredentials} />

        <NFTMetadataForm
          nftName={nftName}
          nftDescription={nftDescription}
          onNameChange={setNftName}
          onDescriptionChange={setNftDescription}
        />

        <MintButton
          onMint={mintNFT}
          isLoading={isLoading}
          isUploading={isUploading}
          isPending={isPending}
        />

        {hash && <TransactionHash hash={hash} />}
      </div>

      <IPFSConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={saveConfig}
        initialApiKey={pinataApiKey}
        initialSecretKey={pinataSecretKey}
      />
    </>
  );
};

export default NFTMinter;
