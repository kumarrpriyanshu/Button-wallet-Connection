document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connectWallet');
    const balanceDiv = document.getElementById('balance');
    const networkSelect = document.getElementById('networkSelect');
    const amountInput = document.getElementById('amount');
    const sideSelect = document.getElementById('side');
    const flipCoinButton = document.getElementById('flipCoin');
    const resultDisplay = document.getElementById('result');

    let web3 = null;
    let solanaConnection = null;
    let userAddress = null;
    let currentNetwork = null;

    // Ethereum wallet connection
    async function connectEthereumWallet() {
        if (window.ethereum) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                web3 = new Web3(window.ethereum);
                userAddress = accounts[0];
                const balance = await web3.eth.getBalance(userAddress);
                const etherBalance = web3.utils.fromWei(balance, 'ether');
                balanceDiv.innerHTML = `Wallet Address: ${userAddress} <br> ETH Balance: ${etherBalance}`;
            } catch (error) {
                console.error('Error connecting to Ethereum wallet:', error);
                balanceDiv.innerHTML = 'Error connecting to wallet';
            }
        } else {
            balanceDiv.innerHTML = 'Please install MetaMask or another Ethereum-compatible wallet.';
        }
    }

    // Solana wallet connection
    async function connectSolanaWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({ onlyIfTrusted: false });
                userAddress = response.publicKey.toString();
                solanaConnection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
                await displayWalletInfo();
            } catch (error) {
                console.error('Error connecting to Solana wallet:', error);
                balanceDiv.innerHTML = `Error connecting to Solana wallet: ${error.message}`;
            }
        } else {
            balanceDiv.innerHTML = 'Phantom wallet not installed. <a href="https://phantom.app/" target="_blank">Install Phantom</a>.';
        }
    }

    // Display wallet info for Solana
    async function displayWalletInfo() {
        if (userAddress && currentNetwork === 'solana') {
            try {
                const balance = await solanaConnection.getBalance(new solanaWeb3.PublicKey(userAddress));
                const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
                balanceDiv.innerHTML = `Wallet Address: ${userAddress} <br> SOL Balance: ${solBalance.toFixed(4)} SOL`;
            } catch (error) {
                console.error('Error fetching wallet info:', error);
                balanceDiv.innerHTML = `Error fetching wallet info: ${error.message}`;
            }
        } else {
            balanceDiv.innerHTML = 'Wallet is not connected.';
        }
    }

    // Coin flip logic
    async function flipCoin(amount, side) {
        if (!amount || !side) {
            resultDisplay.textContent = 'Please enter amount and select a side.';
            return;
        }

        try {
            const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';

            if (currentNetwork === 'ethereum') {
                await flipCoinEthereum(amount, side, flipResult);
            } else if (currentNetwork === 'solana') {
                await flipCoinSolana(amount, side, flipResult);
            }
        } catch (error) {
            resultDisplay.textContent = 'Error during coin flip.';
            console.error('Coin flip error:', error);
        }
    }

    // Ethereum coin flip logic with transaction
    async function flipCoinEthereum(amount, side, flipResult) {
        if (userAddress) {
            try {
                const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
                const rewardInWei = web3.utils.toWei((amount * 2).toString(), 'ether');

                // Check the flip result
                if (flipResult === side) {
                    // Transaction preparation and gas estimation
                    const transaction = {
                        from: userAddress,
                        to: userAddress, // Replace with the correct address
                        value: rewardInWei,
                    };

                    // Estimate gas
                    // const gas = await web3.eth.estimateGas(transaction);
                    // transaction.gas = gas;
                    // transaction.gasPrice = await web3.eth.getGasPrice();

                    // Send the transaction
                    // const receipt = await web3.eth.sendTransaction(transaction);
                    // console.log('Transaction receipt:', receipt);
                    
                    resultDisplay.innerHTML = `
                        You won! The coin landed on ${flipResult}.
                        <br> You received ${amount * 2} ETH.
                    `;
                } else {
                    resultDisplay.innerHTML = `
                        You lost. The coin landed on ${flipResult}.
                        <br> You risked ${amount} ETH.
                    `;
                }
            } catch (error) {
                resultDisplay.textContent = 'Error during Ethereum transaction.';
                console.error('Ethereum transaction error:', error);
            }
        } else {
            resultDisplay.textContent = 'Please connect your wallet first.';
        }
    }

    // Solana coin flip logic with transaction
    async function flipCoinSolana(amount, side, flipResult) {
        if (userAddress) {
            try {
                if (flipResult === side) {
                    const reward = amount * solanaWeb3.LAMPORTS_PER_SOL;
                    const transaction = new solanaWeb3.Transaction().add(
                        solanaWeb3.SystemProgram.transfer({
                            fromPubkey: new solanaWeb3.PublicKey(userAddress),
                            toPubkey: new solanaWeb3.PublicKey(userAddress), // Replace with reward distribution address
                            lamports: reward,
                        })
                    );

                    // await solanaConnection.sendTransaction(transaction, [window.solana], { skipPreflight: false, preflightCommitment: 'confirmed' });
                    resultDisplay.textContent = `You won! The coin landed on ${flipResult}. You received ${amount * 2} SOL.`;
                } else {
                    resultDisplay.textContent = `You lost. The coin landed on ${flipResult}.`;
                }
            } catch (error) {
                resultDisplay.textContent = 'Error during Solana transaction.';
                console.error('Solana transaction error:', error);
            }
        } else {
            resultDisplay.textContent = 'Please connect your wallet first.';
        }
    }

    // Connect wallet button event
    connectWalletButton.addEventListener('click', () => {
        const selectedNetwork = networkSelect.value;
        balanceDiv.innerHTML = 'Connecting...';
        currentNetwork = selectedNetwork; // Store selected network

        if (selectedNetwork === 'ethereum') {
            connectEthereumWallet();
        } else if (selectedNetwork === 'solana') {
            connectSolanaWallet();
        }
    });

    // Flip coin button event
    flipCoinButton.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);
        const side = sideSelect.value;
        flipCoin(amount, side);
    });
});
