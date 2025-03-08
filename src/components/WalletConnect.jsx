import React, { useState } from 'react';

const WalletConnect = ({ wallet }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // For testing without blockchain
  const mockAddress = wallet?.address || '0x1234...5678';
  const isConnected = wallet?.isConnected || false;
  const isConnecting = wallet?.isConnecting || false;
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };
  
  // Close dropdown
  const closeDropdown = () => {
    setShowDropdown(false);
  };
  
  // Handle connect
  const handleConnect = async () => {
    if (wallet?.connect) {
      await wallet.connect();
    }
    closeDropdown();
  };
  
  // Handle disconnect
  const handleDisconnect = () => {
    if (wallet?.disconnect) {
      wallet.disconnect();
    }
    closeDropdown();
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="wallet-connect relative">
      {isConnected ? (
        <button
          className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
          onClick={toggleDropdown}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span>{formatAddress(mockAddress)}</span>
        </button>
      ) : (
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm text-gray-400">Connected as</p>
            <p className="font-medium text-white">{formatAddress(mockAddress)}</p>
          </div>
          <div className="p-2">
            <button
              className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-md"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
