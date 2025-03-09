import { useState } from 'react';
import Navigation from './Navigation';
import Game from './Game';
import Marketplace from './Marketplace';
import useWallet from '../hooks/useWallet';

function GameApp() {
  const [activeTab, setActiveTab] = useState('game');
  const wallet = useWallet();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  // Function to toggle wallet prompt
  const toggleWalletPrompt = () => {
    setShowWalletPrompt(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wallet={wallet} 
        toggleWalletPrompt={toggleWalletPrompt} 
      />

      <main className="container mx-auto p-4">
        {/* Wallet Prompt Modal */}
        {showWalletPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Connect Wallet Required</h3>
              <p className="text-gray-300 mb-6">
                You need to connect your wallet to access the marketplace and other blockchain features.
              </p>
              <div className="flex justify-end space-x-4">
                <button 
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={toggleWalletPrompt}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
                  onClick={() => {
                    toggleWalletPrompt();
                    wallet.connect();
                  }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wrong Network Warning */}
        {wallet.isConnected && !wallet.isCorrectNetwork ? (
          <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl mb-4">Wrong Network</h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              Please switch to the Base network to access blockchain features.
            </p>
            <button 
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
              onClick={wallet.switchToCorrectNetwork}
            >
              Switch to Base Network
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'game' && (
              <>
                <Game wallet={wallet} />
                
                {/* Wallet Connection CTA for non-connected users */}
                {!wallet.isConnected && (
                  <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="mb-4 md:mb-0 md:mr-6">
                        <h3 className="text-xl font-bold text-green-400 mb-2">Enhance Your Game Experience</h3>
                        <p className="text-gray-300">
                          Connect your wallet to generate unique game boards with special blocks, 
                          save your high scores on-chain, and mint your completed games as NFTs.
                        </p>
                      </div>
                      <button 
                        className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-500 transition-colors whitespace-nowrap"
                        onClick={wallet.connect}
                      >
                        Connect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'marketplace' && wallet.isConnected && <Marketplace wallet={wallet} />}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-400">
          <p>BlockTris - A blockchain-enhanced Tetris game on Base</p>
          <p className="text-sm mt-1">
            <a href="/" className="text-green-400 hover:text-green-300">Home</a> | 
            <a href="https://github.com/yourusername/blocktris" className="text-green-400 hover:text-green-300 ml-2">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default GameApp;