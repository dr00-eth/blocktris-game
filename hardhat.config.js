/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    }
  },
  paths: {
    artifacts: './src/artifacts',
  },
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   