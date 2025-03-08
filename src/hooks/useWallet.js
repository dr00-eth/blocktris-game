import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const signer = provider.getSigner();
        setSigner(signer);
        
        const { chainId } = await provider.getNetwork();
        setChainId(chainId);
        
        setAccount(accounts[0]);
        setIsConnected(true);
        setError(null);
        
        return { provider, signer, account: accounts[0] };
      } else {
        setError('Ethereum wallet not detected. Please install MetaMask.');
        return null;
      }
    } catch (error) {
      setError(error.message || 'Failed to connect wallet');
      return null;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            setSigner(signer);
            setAccount(accounts[0]);
            setIsConnected(true);
            
            provider.getNetwork().then(network => {
              setChainId(network.chainId);
            });
          }
        })
        .catch(err => {
          console.error('Error checking wallet connection:', err);
        });
      
      // Setup event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setSigner(provider.getSigner());
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return {
    account,
    provider,
    signer,
    isConnected,
    chainId,
    error,
    connectWallet,
    disconnectWallet
  };
};

export default useWallet;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 