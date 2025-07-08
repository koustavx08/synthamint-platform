interface IPFSConfigWarningProps {
  hasCredentials: boolean;
}

const IPFSConfigWarning = ({ hasCredentials }: IPFSConfigWarningProps) => {
  if (hasCredentials) return null;

  return (
    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
      <p className="text-yellow-300 text-sm">
        ⚠️ Configure your Pinata API credentials to enable real IPFS uploads
      </p>
    </div>
  );
};

export default IPFSConfigWarning;
