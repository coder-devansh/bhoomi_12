/**
 * BhoomiSetu Blockchain Service
 * Provides document hashing and blockchain-based integrity verification
 */

import crypto from 'crypto';

// In-memory blockchain (in production, use a distributed ledger or database)
let blockchain = [];
let pendingTransactions = [];

/**
 * Block structure for the blockchain
 */
class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  // Simple proof of work
  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

/**
 * Initialize the blockchain with genesis block
 */
export const initializeBlockchain = () => {
  if (blockchain.length === 0) {
    const genesisBlock = new Block(0, Date.now(), [{ type: 'genesis', data: 'BhoomiSetu Genesis Block' }], '0');
    genesisBlock.mineBlock(2);
    blockchain.push(genesisBlock);
    console.log('Blockchain initialized with genesis block');
  }
  return blockchain;
};

/**
 * Generate SHA-256 hash for a document/file
 */
export const generateDocumentHash = (fileBuffer) => {
  return crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
};

/**
 * Generate hash from file metadata (for text-based verification)
 */
export const generateMetadataHash = (metadata) => {
  const dataString = JSON.stringify(metadata);
  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex');
};

/**
 * Create a document transaction for the blockchain
 */
export const createDocumentTransaction = (documentData) => {
  const transaction = {
    id: crypto.randomUUID(),
    type: 'DOCUMENT_UPLOAD',
    timestamp: Date.now(),
    data: {
      documentId: documentData.documentId,
      fileName: documentData.fileName,
      fileHash: documentData.fileHash,
      uploadedBy: documentData.uploadedBy,
      disputeId: documentData.disputeId,
      documentType: documentData.documentType,
      metadataHash: generateMetadataHash({
        fileName: documentData.fileName,
        uploadedBy: documentData.uploadedBy,
        timestamp: Date.now()
      })
    },
    signature: generateTransactionSignature(documentData)
  };

  pendingTransactions.push(transaction);
  return transaction;
};

/**
 * Generate a digital signature for a transaction
 */
const generateTransactionSignature = (data) => {
  const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET || 'bhoomisetu-secret');
  hmac.update(JSON.stringify(data) + Date.now());
  return hmac.digest('hex');
};

/**
 * Mine pending transactions into a new block
 */
export const minePendingTransactions = () => {
  if (pendingTransactions.length === 0) {
    return null;
  }

  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = new Block(
    blockchain.length,
    Date.now(),
    pendingTransactions,
    previousBlock.hash
  );

  newBlock.mineBlock(2);
  blockchain.push(newBlock);
  
  const minedTransactions = [...pendingTransactions];
  pendingTransactions = [];
  
  return {
    block: newBlock,
    transactions: minedTransactions
  };
};

/**
 * Verify document integrity by comparing hashes
 */
export const verifyDocumentIntegrity = (documentHash) => {
  for (const block of blockchain) {
    for (const transaction of block.transactions) {
      if (transaction.data?.fileHash === documentHash) {
        return {
          verified: true,
          blockIndex: block.index,
          blockHash: block.hash,
          timestamp: transaction.timestamp,
          transaction: transaction
        };
      }
    }
  }
  return { verified: false };
};

/**
 * Get document blockchain record
 */
export const getDocumentBlockchainRecord = (documentId) => {
  for (const block of blockchain) {
    for (const transaction of block.transactions) {
      if (transaction.data?.documentId === documentId) {
        return {
          found: true,
          blockIndex: block.index,
          blockHash: block.hash,
          previousBlockHash: block.previousHash,
          timestamp: block.timestamp,
          transaction: transaction,
          isValid: validateBlockchain()
        };
      }
    }
  }
  return { found: false };
};

/**
 * Validate the entire blockchain integrity
 */
export const validateBlockchain = () => {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    // Check if current block's hash is valid
    if (currentBlock.hash !== currentBlock.calculateHash()) {
      return false;
    }

    // Check if current block points to correct previous block
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }
  return true;
};

/**
 * Get blockchain statistics
 */
export const getBlockchainStats = () => {
  let totalDocuments = 0;
  
  blockchain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.type === 'DOCUMENT_UPLOAD') {
        totalDocuments++;
      }
    });
  });

  return {
    totalBlocks: blockchain.length,
    totalDocuments: totalDocuments,
    pendingTransactions: pendingTransactions.length,
    isValid: validateBlockchain(),
    latestBlockHash: blockchain[blockchain.length - 1]?.hash,
    genesisBlockHash: blockchain[0]?.hash
  };
};

/**
 * Get full blockchain (for admin/debugging)
 */
export const getFullBlockchain = () => {
  return {
    blocks: blockchain.map(block => ({
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      nonce: block.nonce
    })),
    isValid: validateBlockchain()
  };
};

/**
 * Generate verification certificate for a document
 */
export const generateVerificationCertificate = (documentId) => {
  const record = getDocumentBlockchainRecord(documentId);
  
  if (!record.found) {
    return null;
  }

  return {
    certificateId: crypto.randomUUID(),
    documentId: documentId,
    fileHash: record.transaction.data.fileHash,
    blockchainRecord: {
      blockIndex: record.blockIndex,
      blockHash: record.blockHash,
      transactionId: record.transaction.id,
      timestamp: record.transaction.timestamp
    },
    verification: {
      isValid: record.isValid,
      verifiedAt: new Date().toISOString(),
      chainIntegrity: validateBlockchain() ? 'INTACT' : 'COMPROMISED'
    },
    issuer: 'BhoomiSetu Blockchain Verification System',
    disclaimer: 'This certificate verifies that the document was registered on the BhoomiSetu blockchain and has not been altered since registration.'
  };
};

// Initialize blockchain on module load
initializeBlockchain();

export default {
  initializeBlockchain,
  generateDocumentHash,
  generateMetadataHash,
  createDocumentTransaction,
  minePendingTransactions,
  verifyDocumentIntegrity,
  getDocumentBlockchainRecord,
  validateBlockchain,
  getBlockchainStats,
  getFullBlockchain,
  generateVerificationCertificate
};
