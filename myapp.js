   console.log("app.js loaded");
/* =====================================================================
   CampusFind – app.js  (Ethers.js v6)
   ===================================================================== */

/* ---------------------------------------------------------------------
   STEP 1 – PASTE YOUR CONTRACT ADDRESS HERE
   Remix > Deploy & Run Transactions > Deployed Contracts > copy icon.
   Keep the quotation marks. Example shape: "0x1234...abcd"
--------------------------------------------------------------------- */
const CONTRACT_ADDRESS = "0x029415aeC7dd79f2528Ac1281a64f40716b92ED3";

/* ---------------------------------------------------------------------
   STEP 2 – PASTE YOUR ABI HERE
   Remix > Solidity Compiler > scroll to the bottom > copy icon next to ABI.
   Replace the empty [] below with the copied text (it starts with [ and
   ends with ]).
--------------------------------------------------------------------- */
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "claimItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "reporter",
				"type": "address"
			}
		],
		"name": "ItemClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "reporter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "enum CampusFind.ItemType",
				"name": "itemType",
				"type": "uint8"
			}
		],
		"name": "ItemReported",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_location",
				"type": "string"
			},
			{
				"internalType": "enum CampusFind.ItemType",
				"name": "_itemType",
				"type": "uint8"
			}
		],
		"name": "reportItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getItem",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "enum CampusFind.ItemType",
						"name": "itemType",
						"type": "uint8"
					},
					{
						"internalType": "address",
						"name": "reporter",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "claimed",
						"type": "bool"
					}
				],
				"internalType": "struct CampusFind.Item",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getItemCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

/* ---------------------------------------------------------------------
   Settings (do not change)
--------------------------------------------------------------------- */
const GANACHE_CHAIN_ID = 1337n;
const GANACHE_CHAIN_HEX = "0x539";


/* ---------------------------------------------------------------------
   State
--------------------------------------------------------------------- */
let provider = null;
let signer = null;
let contract = null;
let account = null;
let allItems = [];

/* ---------------------------------------------------------------------
   Page elements
--------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const connectButtons = document.querySelectorAll(".js-connect");
const walletAddressEl = $("walletAddress");
const networkBadge = $("networkBadge");
const reportForm = $("reportForm");
const submitBtn = $("submitBtn");
const searchInput = $("searchInput");
const itemsList = $("itemsList");
const itemsEmpty = $("itemsEmpty");
const itemCountEl = $("itemCount");
const refreshBtn = $("refreshBtn");
const txStatus = $("txStatus");
const txStatusText = $("txStatusText");
const txLink = $("txLink");

/* ---------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------- */
function setStatus(type, message, txHash) {
  txStatus.className = "status status-" + type;
  txStatusText.textContent = message;
  txLink.classList.add("hidden");
}

function shortAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function configIsMissing() {
  return CONTRACT_ADDRESS.startsWith("PASTE_") || CONTRACT_ABI.length === 0;
}

// Turn Ethers/MetaMask errors into a message a student can understand.
function friendlyError(err) {
  if (err && (err.code === "ACTION_REJECTED" || err.code === 4001)) {
    return "You rejected the request in MetaMask. Nothing was sent.";
  }
  if (err && err.code === "INSUFFICIENT_FUNDS") {
return "Not enough Ganache test ETH to pay for gas.";  }
  const raw = (err && (err.reason || err.shortMessage || (err.info && err.info.error && err.info.error.message) || err.message)) || "Unknown error";
  return raw.length > 220 ? raw.slice(0, 220) + "..." : raw;
}

/* ---------------------------------------------------------------------
   Connect wallet + check network
--------------------------------------------------------------------- */
async function connectWallet() {
  if (!window.ethereum) {
    setStatus("error", "MetaMask was not found. Install it from metamask.io and reload this page.");
    return;
  }
  if (configIsMissing()) {
    setStatus("error", "Contract address or ABI is missing. Open app.js and paste them at the top of the file.");
    return;
  }

  try {
    setStatus("pending", "Waiting for you to connect in MetaMask...");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

const onGanache = await ensureGanache();
if (!onGanache) return;

    // Re-create the provider after a possible network switch.
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    account = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    walletAddressEl.textContent = shortAddress(account);
    walletAddressEl.title = account;
    walletAddressEl.classList.remove("hidden");
    networkBadge.textContent = "Ganache Local";
    networkBadge.className = "network-badge network-ok";
    connectButtons.forEach((b) => { b.textContent = "Wallet connected"; b.disabled = true; });

    setStatus("success", "Wallet connected: " + account);
    await loadItems();
  } catch (err) {
    console.error(err);
    setStatus("error", friendlyError(err));
  }
}

async function ensureGanache() {
  const network = await provider.getNetwork();

  if (network.chainId === GANACHE_CHAIN_ID) return true;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_CHAIN_HEX }]
    });

    return true;
  } catch (err) {
    networkBadge.textContent = "Wrong network";
    networkBadge.className = "network-badge network-bad";

    setStatus(
      "error",
      "Please switch MetaMask to Ganache Local, then click Connect again."
    );

    return false;
  }
}
/* ---------------------------------------------------------------------
   Read items  (getItemCount + getItem)
--------------------------------------------------------------------- */
async function loadItems() {
  if (!contract) {
    setStatus("error", "Connect your wallet first.");
    return;
  }
  try {
    itemCountEl.textContent = "Loading items...";
    const count = Number(await contract.getItemCount());

    const calls = [];
    for (let i = 0; i < count; i++) calls.push(contract.getItem(i));
    const results = await Promise.all(calls);

    allItems = results.map((it) => ({
      id: Number(it.id),
      name: it.name,
      description: it.description,
      location: it.location,
      type: Number(it.itemType), // 0 = Lost, 1 = Found
      reporter: it.reporter,
      timestamp: Number(it.timestamp),
      claimed: it.claimed,
    }));

    renderItems();
  } catch (err) {
    console.error(err);
    itemCountEl.textContent = "Could not load items.";
    setStatus("error", "Could not load items: " + friendlyError(err));
  }
}

/* ---------------------------------------------------------------------
   Show items (with search)
   Text is added with textContent, never innerHTML, because item text is
   written by strangers and must not be treated as HTML.
--------------------------------------------------------------------- */
function renderItems() {
  const term = searchInput.value.trim().toLowerCase();
  const shown = allItems
    .filter((it) => it.name.toLowerCase().includes(term))
    .sort((a, b) => b.id - a.id); // newest first

  itemsList.replaceChildren();
  itemsEmpty.classList.toggle("hidden", shown.length > 0);

  if (allItems.length === 0) {
    itemCountEl.textContent = "No items have been reported yet.";
    itemsEmpty.textContent = "Nothing reported yet. Be the first to report an item.";
    itemsEmpty.classList.remove("hidden");
    return;
  }
  itemsEmpty.textContent = "No items match. Try a different name or report a new item.";
  itemCountEl.textContent = term
    ? shown.length + " of " + allItems.length + " items match “" + searchInput.value.trim() + "”"
    : allItems.length + " item" + (allItems.length === 1 ? "" : "s") + " reported";

  shown.forEach((it) => itemsList.appendChild(buildCard(it)));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildCard(it) {
  const isLost = it.type === 0;
  const card = el("article", "item-card " + (it.claimed ? "claimed" : isLost ? "lost" : "found"));

  const top = el("div", "item-top");
  top.appendChild(el("span", "badge " + (isLost ? "badge-lost" : "badge-found"), isLost ? "Lost" : "Found"));
  if (it.claimed) top.appendChild(el("span", "badge badge-claimed", "Claimed"));
  top.appendChild(el("span", "item-id", "#" + it.id));
  card.appendChild(top);

  card.appendChild(el("h3", "", it.name));
  card.appendChild(el("p", "item-desc", it.description));

  const meta = el("ul", "item-meta");
  const rows = [
    ["Location: ", it.location],
    ["Reported: ", new Date(it.timestamp * 1000).toLocaleString()],
    ["Reporter: ", shortAddress(it.reporter)],
  ];
  rows.forEach(([label, value]) => {
    const li = el("li");
    li.appendChild(el("strong", "", label));
    li.appendChild(document.createTextNode(value));
    if (label === "Reporter: ") li.title = it.reporter;
    meta.appendChild(li);
  });
  card.appendChild(meta);

  // Only the original reporter can claim (the contract enforces this too).
  const isReporter = account && it.reporter.toLowerCase() === account.toLowerCase();
  if (isReporter && !it.claimed) {
    const btn = el("button", "btn btn-claim", "Mark as claimed");
    btn.type = "button";
    btn.addEventListener("click", () => claimItem(it.id, btn));
    card.appendChild(btn);
  }
  return card;
}

/* ---------------------------------------------------------------------
   Write: reportItem
--------------------------------------------------------------------- */
async function submitReport(event) {
  event.preventDefault();
  if (!contract) {
    setStatus("error", "Connect your wallet first.");
    return;
  }

  const name = $("itemName").value.trim();
  const description = $("itemDescription").value.trim();
  const location = $("itemLocation").value.trim();
  const type = Number($("itemType").value);

  if (!name || !description || !location) {
    setStatus("error", "Please fill in the item name, description and location.");
    return;
  }

  try {
    submitBtn.disabled = true;
    setStatus("pending", "Confirm the transaction in MetaMask...");
    const tx = await contract.reportItem(name, description, location, type);

setStatus("pending", "Transaction sent. Waiting for confirmation on Ganache...", tx.hash);    
await tx.wait();

    setStatus("success", "Report submitted successfully.", tx.hash);
    reportForm.reset();
    await loadItems();
  } catch (err) {
    console.error(err);
    setStatus("error", "Report failed: " + friendlyError(err));
  } finally {
    submitBtn.disabled = false;
  }
}

/* ---------------------------------------------------------------------
   Write: claimItem
--------------------------------------------------------------------- */
async function claimItem(id, button) {
  try {
    button.disabled = true;
    setStatus("pending", "Confirm the transaction in MetaMask...");
    const tx = await contract.claimItem(id);

setStatus("pending", "Transaction sent. Waiting for confirmation on Ganache...", tx.hash);
    await tx.wait();

    setStatus("success", "Item #" + id + " marked as claimed.", tx.hash);
    await loadItems();
  } catch (err) {
    console.error(err);
    button.disabled = false;
    setStatus("error", "Could not mark as claimed: " + friendlyError(err));
  }
}

/* ---------------------------------------------------------------------
   Wire everything up
--------------------------------------------------------------------- */
connectButtons.forEach((b) => b.addEventListener("click", connectWallet));
reportForm.addEventListener("submit", submitReport);
searchInput.addEventListener("input", renderItems);
refreshBtn.addEventListener("click", loadItems);

// If the user changes account or network in MetaMask, reload to stay in sync.
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}

if (configIsMissing()) {
  setStatus("info", "Setup needed: paste your contract address and ABI at the top of app.js.");
}
