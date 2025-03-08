# BlockTris

BlockTris is a blockchain-enhanced Tetris game built on the Base network where players can create games as NFTs, play with special blocks determined by verifiable randomness, and trade completed game boards.

## Features

- Create games as NFTs on the Base blockchain
- Play with special blocks with unique effects
- Finalize games and mint them as NFTs
- Trade completed game boards in the marketplace
- Participate in tournaments with prize pools

## Tech Stack

- **Blockchain**: Ethereum / Base (L2)
- **Smart Contracts**: Solidity 0.8.17
- **Frontend**: React.js + Vite
- **Blockchain Interaction**: ethers.js v6
- **Game Rendering**: React Konva
- **Storage**: IPFS (NFT.Storage)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MetaMask or another Ethereum wallet
- Base network configured in your wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blocktris.git
   cd blocktris
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your values:
   ```
   cp .env.example .env
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Smart Contract Deployment

1. Compile the contracts:
   ```
   npx hardhat compile
   ```

2. Deploy to the Base network:
   ```
   npx hardhat run scripts/deploy.js --network base
   ```

3. Update your `.env` file with the deployed contract addresses

## Usage

1. Connect your wallet to the Base network
2. Create a new game by paying a small fee
3. Play the game using keyboard controls:
   - Arrow keys: Move blocks
   - Up: Rotate
   - Space: Hard drop
4. Finalize your game to mint it as an NFT
5. View and trade your games in the marketplace

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Base network for providing a fast and low-cost L2 solution
- OpenZeppelin for secure smart contract libraries
- NFT.Storage for decentralized storage solutions
