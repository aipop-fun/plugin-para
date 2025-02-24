import { IAgentRuntime, Service, ServiceType } from "@elizaos/core";
import Para from "@getpara/web-sdk";
import { createWalletClient, http, parseEther, createPublicClient } from "viem";
import { ParaConnector } from "@getpara/viem-integration";

// Define a new service type for Para
export enum ExtendedServiceType {
    PARA_WALLET = "para_wallet",
}

export class ParaWalletService extends Service {
    static serviceType = ExtendedServiceType.PARA_WALLET;

    private para: Para | null = null;
    private initialized = false;

    async initialize(
        device: string | null,
        runtime: IAgentRuntime,
    ): Promise<void> {
        if (this.initialized) return;

        try {
            // Get Para API key from settings
            const paraApiKey = runtime.getSetting("PARA_API_KEY");
            const paraEnv = runtime.getSetting("PARA_ENV") || "production";

            if (!paraApiKey) {
                console.error("Para API key not found in settings");
                return;
            }

            // Initialize Para SDK
            this.para = new Para(paraEnv, paraApiKey);
            this.initialized = true;

            console.log("Para Wallet Service initialized successfully");
        } catch (error) {
            console.error("Failed to initialize Para Wallet Service:", error);
            throw error;
        }
    }

    // Method to create a wallet
    async createWallet(type = "EVM") {
        if (!this.para || !this.initialized) {
            throw new Error("Para Wallet Service not initialized");
        }

        try {
            const wallet = await this.para.createWallet({ type });
            return wallet;
        } catch (error) {
            console.error("Failed to create Para wallet:", error);
            throw error;
        }
    }

    // Method to generate a pre-generated wallet
    async createPregenWallet({
        pregenIdentifier,
        pregenIdentifierType = "EMAIL"
    }: {
        pregenIdentifier: string;
        pregenIdentifierType: string;
    }) {
        if (!this.para || !this.initialized) {
            throw new Error("Para Wallet Service not initialized");
        }

        try {
            const hasWallet = await this.para.hasPregenWallet({
                pregenIdentifier,
                pregenIdentifierType,
            });

            if (hasWallet) {
                console.log("Pregenerated wallet already exists for this identifier");
                const wallets = await this.para.getPregenWallets({
                    pregenIdentifier,
                    pregenIdentifierType,
                });
                return wallets[0];
            }

            const wallet = await this.para.createPregenWallet({
                type: "EVM",
                pregenIdentifier,
                pregenIdentifierType,
            });

            // Get and store user share
            const userShare = await this.para.getUserShare();

            return {
                wallet,
                userShare,
            };
        } catch (error) {
            console.error("Failed to create Para pregen wallet:", error);
            throw error;
        }
    }

    // Method to sign a message
    async signMessage({ walletId, message }: { walletId: string; message: string }) {
        if (!this.para || !this.initialized) {
            throw new Error("Para Wallet Service not initialized");
        }

        try {
            const messageBase64 = btoa(message);
            const signature = await this.para.signMessage({
                walletId,
                messageBase64,
            });

            return signature;
        } catch (error) {
            console.error("Failed to sign message with Para wallet:", error);
            throw error;
        }
    }

    // Method to sign a transaction
    async signTransaction({
        walletId,
        transaction,
        chainId
    }: {
        walletId: string;
        transaction: any;
        chainId: string;
    }) {
        if (!this.para || !this.initialized) {
            throw new Error("Para Wallet Service not initialized");
        }

        try {
            // Get wallet information
            const wallets = await this.para.getWallets();
            const wallet = wallets[walletId];

            if (!wallet) {
                throw new Error(`Wallet with ID ${walletId} not found`);
            }

            // Initialize Viem clients
            const transport = http(this.getSuitableRpcUrl(chainId));

            // Create a wallet client using Para connector
            const client = createWalletClient({
                transport,
                connector: new ParaConnector({
                    para: this.para,
                    walletId
                })
            });

            // Create a public client for chain interaction
            const publicClient = createPublicClient({
                transport,
                chain: this.getChainFromId(chainId)
            });

            // Process the transaction based on type
            let hash;
            if (transaction.data) {
                // Contract interaction
                hash = await client.sendTransaction({
                    to: transaction.to,
                    value: transaction.value ? parseEther(transaction.value) : undefined,
                    data: transaction.data,
                    gas: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined
                });
            } else {
                // Simple ETH transfer
                hash = await client.sendTransaction({
                    to: transaction.to,
                    value: parseEther(transaction.value || "0"),
                    gas: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined
                });
            }

            // Wait for transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            return {
                hash,
                receipt
            };
        } catch (error) {
            console.error("Failed to sign transaction with Para wallet:", error);
            throw error;
        }
    }

    // Helper method to get appropriate RPC URL based on chain ID
    private getSuitableRpcUrl(chainId: string): string {
        const chainIdMap: Record<string, string> = {
            "1": "https://eth-mainnet.g.alchemy.com/v2/demo",
            "11155111": "https://eth-sepolia.g.alchemy.com/v2/demo",
            "137": "https://polygon-mainnet.g.alchemy.com/v2/demo",
            "42161": "https://arb-mainnet.g.alchemy.com/v2/demo",
            // Add more networks as needed
        };

        return chainIdMap[chainId] || "https://eth-mainnet.g.alchemy.com/v2/demo";
    }

    // Helper to get chain configuration from chain ID
    private getChainFromId(chainId: string) {
        const mainnet = {
            id: 1,
            name: 'Ethereum',
            nativeCurrency: {
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
            },
            rpcUrls: {
                default: { http: [this.getSuitableRpcUrl("1")] },
            }
        };

        const sepolia = {
            id: 11155111,
            name: 'Sepolia',
            nativeCurrency: {
                decimals: 18,
                name: 'Sepolia Ether',
                symbol: 'ETH',
            },
            rpcUrls: {
                default: { http: [this.getSuitableRpcUrl("11155111")] },
            }
        };

        const polygon = {
            id: 137,
            name: 'Polygon',
            nativeCurrency: {
                decimals: 18,
                name: 'MATIC',
                symbol: 'MATIC',
            },
            rpcUrls: {
                default: { http: [this.getSuitableRpcUrl("137")] },
            }
        };

        const arbitrum = {
            id: 42161,
            name: 'Arbitrum',
            nativeCurrency: {
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
            },
            rpcUrls: {
                default: { http: [this.getSuitableRpcUrl("42161")] },
            }
        };

        // Map chain ID to chain object
        const chains: Record<string, any> = {
            "1": mainnet,
            "11155111": sepolia,
            "137": polygon,
            "42161": arbitrum
        };

        return chains[chainId] || mainnet;
    }

    // Public accessor for para instance
    get paraInstance(): Para | null {
        return this.para;
    }
}