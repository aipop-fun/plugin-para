import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { getParaWalletService } from "./index";

export const createWalletAction: Action = {
    name: "CREATE_PARA_WALLET",
    similes: ["MAKE_PARA_WALLET", "GENERATE_PARA_WALLET"],
    description: "Create a new Para wallet for the user",

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

            // Extract wallet type from the message if provided
            const content = message.content as any;
            const walletType = content.walletType || "EVM";

            // Create wallet
            const wallet = await service.createWallet(walletType);

            // Return the wallet info
            return {
                text: `Created a new Para wallet of type ${walletType}`,
                wallet: {
                    id: wallet.id,
                    address: wallet.address,
                    type: wallet.type,
                },
            };
        } catch (error) {
            console.error("Error creating Para wallet:", error);
            return {
                text: "Failed to create Para wallet",
                error: error.message,
            };
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Create a new wallet for me" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll create a new Para wallet for you",
                    action: "CREATE_PARA_WALLET"
                },
            },
        ],
    ],
};