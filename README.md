# CampusFind – Decentralized University Lost & Found
**Course:** MG3012 – Blockchain Technology for Business  
**Assignment:** 3 (Continuation of Assignment 2)  
**Name:** Ahmad Bilal Zaheer  
**Student ID:** 24i-5675

## Project Overview
CampusFind is a lost-and-found website I made for university students. Students can use it to report things they've lost or found around campus.

Instead of using a regular database, the website uses an Ethereum smart contract to save the reports on the blockchain. This means the reports can't just be edited or deleted by someone.

In Assignment 2, I made the smart contract using Solidity and deployed it through Remix on the Sepolia test network. For Assignment 3, I used Truffle and Ganache to deploy the contract locally and connect it to the same website.

## Features
The website allows users to:
- Connect their MetaMask wallet.
- Report lost or found items with a name, description and location.
- View all reported items.
- Search for items by name.
- Mark an item as claimed.
- See whether a transaction was successful or failed.

Only the person who originally reported an item can mark it as claimed. This is controlled by the smart contract.

## Tools Used
- **Solidity 0.8.20:** Used to write the smart contract.
- **Truffle 5.11.5:** Used to compile and deploy the contract.
- **Ganache Desktop 2.7.1:** Used to run a local Ethereum blockchain.
- **MetaMask:** Used to connect a wallet and approve transactions.
- **Ethers.js v6:** Used to connect the website with the smart contract.
- **HTML, CSS and JavaScript:** Used to build the website.
- **VS Code:** Used to work on the project files.
- **Remix IDE:** Used in Assignment 2 to develop and deploy the original contract.

## Project Files
- **SmartContract.sol:** Contains the smart contract inside the contracts folder.
- **2_deploy_campusfind.js:** Contains the deployment script inside the migrations folder.
- **CampusFind.json:** Contains the compiled contract information inside build/contracts.
- **myindex.html:** Contains the website's HTML.
- **myapp.js:** Handles MetaMask and the smart contract functions.
- **style.css:** Contains the website's styling.
- **truffle-config.js:** Contains the Truffle network and compiler settings.
- **screenshots:** Contains screenshots taken during the assignment.
- **README.md:** Contains the project information and instructions.

## Smart Contract Functions
The smart contract has four main functions:
- **reportItem():** Adds a new lost or found item.
- **getItem():** Gets the details of a reported item.
- **getItemCount():** Shows how many items have been reported.
- **claimItem():** Lets the original reporter mark their item as claimed.

The contract also has two events called ItemReported and ItemClaimed, which are triggered when an item is reported or claimed.

## Truffle and Ganache Setup
For this assignment, I used Ganache Desktop to create a local Ethereum blockchain and connected Truffle to it.

These were my network settings:
- **Network:** Ganache Local
- **Network ID:** 5777
- **Chain ID:** 1337
- **RPC URL:** http://127.0.0.1:7545
- **Solidity Version:** 0.8.20
- **EVM Version:** Paris

### Compiling the Contract
I opened the terminal in VS Code and used the command `truffle compile --all` to compile the contract.

The contract compiled successfully.

### Deploying the Contract
I created the migration file called `2_deploy_campusfind.js` and used the command `truffle migrate --reset --network development` to deploy the contract to Ganache.

The deployment was successful.

**Contract Address:**  
`0x029415aeC7dd79f2528Ac1281a64f40716b92ED3`

**Deployment Transaction Hash:**  
`0x232b94a2ef2d4969f1b973beee74f83934b70a1885ea5b368022947b848792aa`

## Connecting the Website
After deploying the contract, I changed the contract address in `myapp.js` to the new Ganache address.

Since the website was previously using Sepolia, I also had to change its network settings to Ganache Local.

I added the Ganache network to MetaMask using Chain ID 1337 and imported one of the test accounts from Ganache.

After that, I opened the website using Live Server in VS Code and connected MetaMask. The wallet connected successfully.

## Testing
After connecting everything, I tested the website to check if it was working properly with the smart contract.

### Test 1 – Connecting MetaMask
I connected MetaMask to the website while using the Ganache Local network. The website showed the connected wallet address.

### Test 2 – Reporting an Item
I reported a lost item called "Black Wallet" and entered its description and location.

MetaMask asked me to confirm the transaction. After I confirmed it, the item was added and appeared on the website.

### Test 3 – Claiming an Item
I clicked "Mark as claimed" on the Black Wallet item.

After confirming the transaction in MetaMask, the item showed up as claimed on the website.

I also checked Ganache Desktop, where the transactions were recorded.

## Screenshots
I saved screenshots of the Truffle deployment, Ganache transactions, MetaMask connection, claimed item and project structure in the `screenshots` folder.

## Problems I Faced
One issue I ran into was an "invalid opcode" error while deploying the contract. The contract was compiling properly, but it wasn't deploying to Ganache.

I found that the issue was related to the EVM version. I changed the EVM version to `paris` in `truffle-config.js`, compiled the contract again and redeployed it. This fixed the problem.

I also had to change some parts of the JavaScript file because the website was originally made for Sepolia. I updated the network settings, contract address and transaction messages so everything would work with Ganache.

## Limitations
The project currently runs on a local blockchain, so Ganache needs to be running for the website to work properly.

Also, the website doesn't actually verify whether someone owns a lost item. It only makes sure that the person who reported an item is the one who can mark it as claimed.

## Conclusion
For Assignment 3, I took my CampusFind project from Assignment 2 and got it working with Truffle and Ganache instead of Remix and Sepolia.

I was able to deploy the smart contract, connect MetaMask and test reporting and claiming items through the website.

This assignment helped me understand how to deploy a smart contract using Truffle and how to connect it to a website running on a local blockchain.