import { Input } from '@/components/ui/input';

interface NFTMetadataFormProps {
  nftName: string;
  nftDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const NFTMetadataForm = ({
  nftName,
  nftDescription,
  onNameChange,
  onDescriptionChange,
}: NFTMetadataFormProps) => {
  return (
    <div className="space-y-3">
      <Input
        placeholder="NFT Name (optional)"
        value={nftName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
      />
      <Input
        placeholder="NFT Description (optional)"
        value={nftDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
      />
    </div>
  );
};

export default NFTMetadataForm;
