import React from 'react';

const Marketplace = ({ wallet }) => {
  // Mock data for testing
  const mockGames = [
    {
      id: 1,
      player: '0x1234...5678',
      score: 12500,
      price: '0.05 ETH',
      createdAt: '2 days ago'
    },
    {
      id: 2,
      player: '0xabcd...ef01',
      score: 8750,
      price: '0.03 ETH',
      createdAt: '3 days ago'
    },
    {
      id: 3,
      player: '0x9876...5432',
      score: 15200,
      price: '0.08 ETH',
      createdAt: '1 day ago'
    }
  ];
  
  return (
    <div className="marketplace p-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">BlockTris Marketplace</h2>
        <p className="text-gray-400">
          Browse and purchase completed BlockTris games as NFTs
        </p>
      </div>
      
      {!wallet?.isConnected ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium mb-4">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-4">
            Connect your wallet to browse and purchase BlockTris games
          </p>
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-medium"
            onClick={wallet?.connect}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">Available Games</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                Newest First
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                Highest Score
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGames.map(game => (
              <div key={game.id} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Game #{game.id}</h4>
                      <p className="text-sm text-gray-400">By {game.player}</p>
                    </div>
                    <div className="bg-blue-900 px-2 py-1 rounded text-sm">
                      {game.price}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Score:</span>
                    <span className="font-medium text-green-400">{game.score}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Created:</span>
                    <span>{game.createdAt}</span>
                  </div>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-medium">
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-4">Your Games</h3>
            <p className="text-gray-400 text-center py-8">
              You don't have any games yet. Play BlockTris to create your first game!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
