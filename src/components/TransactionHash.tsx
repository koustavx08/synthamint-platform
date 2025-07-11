import { ExternalLink } from 'lucide-react';

interface TransactionHashProps {
  hash: string;
}

const TransactionHash = ({ hash }: TransactionHashProps) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-500/30">
        <span className="font-medium">Transaction:</span>
        <a 
          href={`https://testnet.snowtrace.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 transition-colors"
        >
          {hash.slice(0, 10)}...{hash.slice(-8)}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default TransactionHash;
