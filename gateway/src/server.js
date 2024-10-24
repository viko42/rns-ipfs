// server.js
const express = require('express');
const { ethers } = require('ethers');
const NodeCache = require('node-cache');

const app = express();

// Cache system (keeps items for 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

// Create Helia instance
let helia;
let fs;

async function initializeHelia() {
  const { createHelia } = await import('helia');
  const { unixfs } = await import('@helia/unixfs');
  
  helia = await createHelia();
  fs = unixfs(helia);

  // Vérifier la connexion au réseau IPFS
  const peers = await helia.libp2p.peerStore.all();
  console.log(`Connected to ${peers.length} peers`);
}

// Modify this part
async function startServer() {
  await initializeHelia();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Your Ethereum provider
const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
  throw new Error('RPC_URL environment variable is not set');
}
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Your Ethereum contract
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error('CONTRACT_ADDRESS environment variable is not set');
}
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_defaultIpfsLink",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_nftContractAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            }
        ],
        "name": "getIpfsLink",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "defaultIpfsLink",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nftContract",
        "outputs": [
            {
                "internalType": "contract RNSChecker",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "ipfsLink",
                "type": "string"
            }
        ],
        "name": "updateRnsLink",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_newDefaultLink",
                "type": "string"
            }
        ],
        "name": "updateDefaultIpfsLink",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Helper function to get IPFS content using ID
async function getIpfsContentById(id) {
    try {
        // Check cache first
        const cached = cache.get(id);
        if (cached) {
            console.log(`Cache hit for ${id}`);
            return cached;
        }

        console.log(`[0] Fetching IPFS hash for ID ${id}`);
        const ipfsHash = await contract.getIpfsLink(id); // Call contract function

        if (!ipfsHash) {
            throw new Error('No IPFS hash found');
        }

        if (!fs) {
            throw new Error('IPFS system not initialized');
        }

        // Get content from IPFS using Helia
        const decoder = new TextDecoder()
        let content = ''
        for await (const chunk of fs.cat(ipfsHash)) {
            content += decoder.decode(chunk, { stream: true })
        }

        // Save to cache
        cache.set(id, content);

        return content;
    } catch (error) {
        console.error(`Error for ID ${id}:`, error);
        throw error;
    }
}

// Middleware to extract subdomain as rnssubdomainid
app.use((req, res, next) => {
    const host = req.headers.host;
    const subdomain = host.split('.')[0]; // Assumes subdomain is the first part
    req.rnssubdomainid = subdomain;
    console.log({ subdomain })
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.send('OK');
});
// Main route handler
app.get('/', async (req, res) => {
    try {
        const rnssubdomainid = req.rnssubdomainid;
        
        console.log({ host: req.headers.host });
        // Basic validation
        if (!rnssubdomainid || rnssubdomainid.length < 3) {
            return res.status(400).send('Invalid subdomain ID');
        }

        const content = await getIpfsContentById(rnssubdomainid);
        res.send(content);

    } catch (error) {
        if (error.message === 'No IPFS hash found') {
            res.status(404).send('No IPFS content found for this subdomain ID');
        } else {
            console.error('Server error:', error);
            res.status(500).send('Error fetching content');
        }
    }
});



// Move this to the end of the file
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle errors gracefully
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
