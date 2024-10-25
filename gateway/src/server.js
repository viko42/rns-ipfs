// server.js
const express = require("express");
const { ethers } = require("ethers");
const NodeCache = require("node-cache");

const app = express();

// Cache system (keeps items for 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

// Initialize Helia IPFS client and UnixFS interface
async function initializeHelia() {
  const { createHelia } = await import("helia");
  const { unixfs } = await import("@helia/unixfs");

  helia = await createHelia();
  fs = unixfs(helia);

  // Log the number of connected IPFS peers for monitoring
  const peers = await helia.libp2p.peerStore.all();
  console.log(`Connected to ${peers.length} IPFS peers`);
}

// Server startup function
async function startServer() {
  await initializeHelia();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
  throw new Error("RPC_URL environment variable is not set");
}
const provider = new ethers.JsonRpcProvider(rpcUrl);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractRNSUnifiedAddress = process.env.CONTRACT_RNS_UNIFIED_ADDRESS;
if (!contractAddress) {
  throw new Error("CONTRACT_ADDRESS environment variable is not set");
}
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_defaultIpfsLink",
        type: "string",
      },
      {
        internalType: "address",
        name: "_nftContractAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
    ],
    name: "getIpfsLink",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "defaultIpfsLink",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nftContract",
    outputs: [
      {
        internalType: "contract RNSChecker",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsLink",
        type: "string",
      },
    ],
    name: "updateRnsLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_newDefaultLink",
        type: "string",
      },
    ],
    name: "updateDefaultIpfsLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const contractRNSUnifiedABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "namehash",
    outputs: [
      {
        internalType: "bytes32",
        name: "hashed",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const contractRNSUnified = new ethers.Contract(
  contractRNSUnifiedAddress,
  contractRNSUnifiedABI,
  provider
);

// Retrieve the namehash for a given RNS (Ron Name Service) domain
async function getRNSUnifiedLink(rns) {
  try {
    const namehash = await contractRNSUnified.namehash(rns);
    // Convert the bytes32 namehash to a decimal string for use as an ID
    return BigInt(namehash).toString(10);
  } catch (error) {
    console.error(`Error generating namehash for RNS ${rns}:`, error);
    throw error;
  }
}

// Fetch IPFS content using the provided ID (namehash)
async function getIpfsContentById(id) {
  try {
    // Check in-memory cache first to reduce blockchain calls and IPFS lookups
    const cached = cache.get(id);
    if (cached) return cached;

    // Retrieve IPFS hash from the smart contract
    const ipfsHash = await contract.getIpfsLink(id);
    if (!ipfsHash) throw new Error("No IPFS hash found for this ID");

    if (!fs) throw new Error("IPFS system not initialized");

    // Fetch and decode content from IPFS
    const decoder = new TextDecoder();
    let content = "";
    for await (const chunk of fs.cat(ipfsHash)) {
      content += decoder.decode(chunk, { stream: true });
    }

    // Cache the fetched content
    cache.set(id, content);

    return content;
  } catch (error) {
    console.error(`Error fetching IPFS content for ID ${id}:`, error);
    throw error;
  }
}

// Middleware to extract subdomain from host header
app.use((req, res, next) => {
  const host = req.headers.host;
  req.rnssubdomain = host.split(".")[0]; // Assumes subdomain is the first part
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.send("OK");
});

// Main route handler for serving IPFS content based on RNS subdomain
app.get("/", async (req, res) => {
  try {
    const rnssubdomain = req.rnssubdomain;

    // Basic validation to ensure subdomain is present and of minimum length
    if (!rnssubdomain || rnssubdomain.length < 3) {
      return res.status(400).send("Invalid RNS subdomain");
    }

    // Generate namehash ID for the RNS domain
    const rnsId = await getRNSUnifiedLink(`${rnssubdomain}.ron`);
    // Fetch IPFS content using the namehash ID
    const content = await getIpfsContentById(rnsId);
    res.send(content);
  } catch (error) {
    if (error.message === "No IPFS hash found for this ID") {
      res.status(404).send("No IPFS content found for this subdomain");
    } else {
      console.error("Server error:", error);
      res.status(500).send("Error fetching content");
    }
  }
});

// Move this to the end of the file
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Handle errors gracefully
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
