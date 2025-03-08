import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-400">BlockTris</h1>
          <div className="flex space-x-4">
            <Link 
              to="/app" 
              className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
            >
              Enter Game
            </Link>
          </div>
        </div>
      </header>

      <main className={`flex-grow container mx-auto p-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <section className="py-16 md:py-24 flex flex-col items-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              BlockTris: Tetris on the Blockchain
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A revolutionary gaming experience that combines classic Tetris gameplay with blockchain technology
            </p>
            <Link 
              to="/app" 
              className="px-8 py-4 bg-green-600 rounded-lg hover:bg-green-500 transition-colors text-xl font-bold inline-block"
            >
              Play Now
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              title="Play Without Limits" 
              description="Jump right in and play classic Tetris with a blockchain twist. No wallet required to start playing!"
              icon="🎮"
            />
            <FeatureCard 
              title="Mint Unique Games" 
              description="Connect your wallet to create unique game boards as NFTs with special blocks and effects."
              icon="🔗"
            />
            <FeatureCard 
              title="Collect & Trade" 
              description="Complete games become collectible NFTs that can be traded in the marketplace."
              icon="💎"
            />
          </div>
        </section>

        <section className="py-16 bg-gray-800 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <StepCard 
              number="1" 
              title="Play Anytime" 
              description="Start playing immediately without connecting a wallet."
            />
            <StepCard 
              number="2" 
              title="Connect Wallet" 
              description="Connect to Base network to unlock blockchain features."
            />
            <StepCard 
              number="3" 
              title="Mint Games" 
              description="Create unique game boards with special blocks and effects."
            />
            <StepCard 
              number="4" 
              title="Collect & Trade" 
              description="Completed games become NFTs you can trade in the marketplace."
            />
          </div>
        </section>

        <section className="py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Special Blockchain Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureDetail 
              title="Verifiable Randomness" 
              description="Game blocks are determined by Chainlink VRF, ensuring fair and provably random gameplay."
            />
            <FeatureDetail 
              title="Special Blocks" 
              description="Discover unique blockchain-powered blocks with special effects like explosions, time freeze, and more."
            />
            <FeatureDetail 
              title="Tournaments" 
              description="Compete in tournaments with prize pools and earn rewards for your skills."
            />
            <FeatureDetail 
              title="Collectible Boards" 
              description="Each completed game becomes a unique NFT with its own history and properties."
            />
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 p-6 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>BlockTris - A blockchain-enhanced Tetris game on Base</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white">Discord</a>
            <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper components
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-green-400">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const FeatureDetail = ({ title, description }) => (
  <div className="bg-gray-800 p-6 rounded-xl">
    <h3 className="text-xl font-bold mb-2 text-green-400">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default LandingPage; 