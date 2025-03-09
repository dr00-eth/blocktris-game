import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const Navigation = ({ activeTab, setActiveTab, wallet, toggleWalletPrompt }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleTabClick = (tab) => {
    if (tab === 'marketplace' && !wallet.isConnected) {
      toggleWalletPrompt();
    } else {
      setActiveTab(tab);
    }
    setMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-400">BlockTris</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'game' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => handleTabClick('game')}
          >
            Game
          </button>
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'marketplace' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => handleTabClick('marketplace')}
          >
            Marketplace
          </button>
        </div>
        
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center">
          <button 
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 mr-3"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          <div className="md:hidden">
            <WalletConnect wallet={wallet} />
          </div>
        </div>
        
        {/* Desktop Wallet Connect */}
        <div className="hidden md:block">
          <WalletConnect wallet={wallet} />
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-gray-700 rounded-md shadow-lg overflow-hidden">
          <button 
            className={`w-full text-left px-4 py-3 ${activeTab === 'game' ? 'bg-green-600' : 'hover:bg-gray-600'}`}
            onClick={() => handleTabClick('game')}
          >
            Game
          </button>
          <button 
            className={`w-full text-left px-4 py-3 ${activeTab === 'marketplace' ? 'bg-green-600' : 'hover:bg-gray-600'}`}
            onClick={() => handleTabClick('marketplace')}
          >
            Marketplace
          </button>
        </div>
      )}
    </header>
  );
};

export default Navigation;