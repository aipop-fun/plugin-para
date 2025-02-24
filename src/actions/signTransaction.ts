import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { getParaWalletService } from "./index";

export const signTransactionAction: Action = {
    name: "SIGN_PARA_TRANSACTION",
    similes: ["PARA_SIGN_TX", "SIGN_TX_PARA"],
    description: "Sign a transaction using a Para wallet",

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            const service = getParaWalletService(runtime);
            return !!service.paraInstance;
        } catch (error) {
            return false;
        }
    },

    handler: async (runtime: IAgentRuntime, message: Memory, state?: any) => {
        try {
            const service = getParaWalletService(runtime);

            // Extract transaction info from the message
            const content = message.content as any;
            const { walletId, transaction, chainId } = content;

            if (!walletId || !transaction || !chainId) {
                return {
                    text: "Missing required parameters. Please provide walletId, transaction, and chainId.",
                };
            }

            // Sign transaction
            const response = await service.signTransaction({
                walletId,
                transaction,
                chainId,
            });

            // Return the transaction result
            return {
                text: `Successfully signed transaction with Para wallet`,
                transactionHash: response.hash,
                receipt: response.receipt,
            };
        } catch (error) {
            console.error("Error signing transaction with Para wallet:", error);
            return {
                text: "Failed to sign transaction with Para wallet",
                error: error.message,
            };
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Sign this transaction",
                    walletId: "wallet-123",
                    transaction: {
                        to: "0x1234567890123456789012345678901234567890",
                        value: "0.01",
                        gas: "21000",
                    },
                    chainId: "1"
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll sign that transaction for you",
                    action: "SIGN_PARA_TRANSACTION"
                },
            },
        ],
    ],
};