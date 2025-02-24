import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { getParaWalletService } from "./index";

export const signMessageAction: Action = {
    name: "SIGN_PARA_MESSAGE",
    similes: ["PARA_SIGN_MESSAGE", "SIGN_MESSAGE_PARA"],
    description: "Sign a message using a Para wallet",

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

            // Extract message and wallet ID from the message
            const content = message.content as any;
            const { walletId, messageToSign } = content;

            if (!walletId || !messageToSign) {
                return {
                    text: "Missing required parameters. Please provide walletId and messageToSign.",
                };
            }

            // Sign message
            const signature = await service.signMessage({
                walletId,
                message: messageToSign,
            });

            // Return the signature
            return {
                text: `Successfully signed message with Para wallet`,
                signature,
            };
        } catch (error) {
            console.error("Error signing message with Para wallet:", error);
            return {
                text: "Failed to sign message with Para wallet",
                error: error.message,
            };
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Sign this message: Hello World",
                    walletId: "wallet-123",
                    messageToSign: "Hello World"
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll sign that message for you",
                    action: "SIGN_PARA_MESSAGE"
                },
            },
        ],
    ],
};