import * as dotenv from "dotenv";
dotenv.config();

let alchemyAPIKey = process.env.ALCHEMY_API_KEY || "";
export const constants = Object.freeze({
  account: {
    deployerAddress: process.env.DEPLOYER_ADDRESS || "",
    deployerPrivateKey: process.env.PRIVATE_KEY || "",
  },
  contracts: {
    swap: {
      sepolia: process.env.CONTRACT_SEPOLIA || "",
    },
  },
  integrations: {
    alchemy: {
      apiKey: alchemyAPIKey,
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${alchemyAPIKey}`,
      amoy: `https://polygon-amoy.g.alchemy.com/v2/${alchemyAPIKey}`,
    },
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    infura: {
      apiKey: process.env.INFURA_API_KEY || "",
      apiSecret: process.env.INFURA_API_SECRET || "",
    },
    pokt: {
      apiKey: process.env.POKT_API_KEY || "",
    },
  },
});
