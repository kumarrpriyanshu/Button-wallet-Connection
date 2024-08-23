
const connectWalletButton = document.getElementById('connectWallet');
const balanceDiv = document.getElementById('balance');
const networkSelect = document.getElementById('networkSelect');
async function connectEthereumWallet() {
    if (window.ethereum) {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const balance = await web3.eth.getBalance(accounts[0]);
            const etherBalance = web3.utils.fromWei(balance, 'ether');
            balanceDiv.innerHTML = `Wallet Address: ${accounts[0]} <br> ETH Balance: ${etherBalance}`;
        } catch (error) {
            console.error('Error connecting to wallet', error);
            balanceDiv.innerHTML = 'Error connecting to wallet';
        }
    } else {
        balanceDiv.innerHTML = 'Please install MetaMask or another Ethereum-compatible wallet.';
    }
}
// Function to connect to Solana Wallet using Phantom
async function connectSolanaWallet() {
    if (window.solana && window.solana.isPhantom) {
        console.log("Phantom wallet detected.");

        try {
            // Prompt the user to connect the Phantom wallet
            const response = await window.solana.connect({ onlyIfTrusted: false });
            console.log("Phantom wallet connected:", response);

            // Display wallet info
            await displayWalletInfo();  // Call the function to fetch and display wallet info
        } catch (error) {
            console.error("Error connecting to Solana wallet:", error);
            balanceDiv.innerHTML = `Error connecting to Solana wallet: ${error.message}`;
        }
    } else {
        balanceDiv.innerHTML = 'Phantom wallet not installed. <a href="https://phantom.app/">Install Phantom</a>.';
    }
}

// Function to display the wallet's public key and balance
async function displayWalletInfo() {
    try {
        // Check if wallet is connected
        if (window.solana && window.solana.isConnected) {
            const publicKey = window.solana.publicKey.toString();
            console.log("Wallet Public Key:", publicKey);

        
          
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
             console.log("Connected to Solana mainnet.");

            // Fetch the balance in SOL
            const balance = await connection.getBalance(new solanaWeb3.PublicKey(publicKey));
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            console.log("SOL Balance:", solBalance);

            // Display the wallet address and SOL balance
            balanceDiv.innerHTML = `Wallet Address: ${publicKey} <br> SOL Balance: ${solBalance.toFixed(4)} SOL`;
        } else {
            balanceDiv.innerHTML = 'Wallet is not connected.';
        }
    } catch (error) {
        console.error("Error fetching wallet info:", error);
        balanceDiv.innerHTML = `Error fetching wallet info: ${error.message}`;
    }
}

// Add event listener for the "Connect Wallet" button
connectWalletButton.addEventListener('click', () => {
    const selectedNetwork = networkSelect.value;
    balanceDiv.innerHTML = 'Connecting...';

    if (selectedNetwork === 'ethereum') {
        connectEthereumWallet(); // Placeholder for Ethereum logic
    } else if (selectedNetwork === 'solana') {
        connectSolanaWallet(); // Connect to Solana
    }
});

