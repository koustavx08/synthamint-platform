interface TransactionHashProps {
  hash: string;
}

const TransactionHash = ({ hash }: TransactionHashProps) => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-400">
        Transaction Hash: 
        <a 
          href={`https://testnet.snowtrace.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 ml-1"
        >
          {hash.slice(0, 10)}...{hash.slice(-8)}
        </a>
      </p>
    </div>
  );
};

export default TransactionHash;
