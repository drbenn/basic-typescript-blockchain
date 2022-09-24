"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
class Block {
    constructor(prevHash, transaction, timeStamp = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.timeStamp = timeStamp;
        // number only used once
        this.nonce = Math.round(Math.random() * 999999999);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}
class Chain {
    constructor() {
        this.chain = [new Block('', new Transaction(1000, 'genesis', 'godwin'))];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    // Validates each block on chain
    mine(nonce) {
        let solution = 1;
        console.log('🐢 Mining transaction...');
        // Keep looping until solution is found
        while (true) {
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();
            const attempt = hash.digest('hex');
            // Add more 0's to make it harder
            if (attempt.substr(0, 4) === '0000') {
                console.log(`---> Solved transaction with solution: ${solution}. Block is confirmed!\n`);
                return solution;
            }
            solution += 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        console.log("🐢 Sending TurtleCoin...");
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            console.log("🐢 Transaction is valid!");
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }
}
Chain.instance = new Chain();
class Wallet {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
const agp = new Wallet();
const jz = new Wallet();
const jb = new Wallet();
agp.sendMoney(50, jz.publicKey);
jz.sendMoney(23, jb.publicKey);
jb.sendMoney(5, jz.publicKey);
console.log(Chain.instance);
