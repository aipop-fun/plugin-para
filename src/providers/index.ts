import { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ExtendedServiceType, ParaWalletService } from "../services/paraWalletService";

// Provider that shows Para wallet information
export const paraWalletProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const service = runtime.getService<ParaWalletService>(
                ExtendedServiceType.PARA_WALLET
            );

            if (!service || !service.paraInstance) {
                return "Para wallet service is not initialized.";
            }

            // Get wallets
            const wallets = await service.paraInstance.getWallets();

            if (!wallets || Object.keys(wallets).length === 0) {
                return "No Para wallets available.";
            }

            // Format wallet information
            let walletInfo = "# Para Wallets\n\n";

            Object.entries(wallets).forEach(([id, wallet]) => {
                walletInfo += `## Wallet: ${id}\n`;
                walletInfo += `- Address: ${wallet.address}\n`;
                walletInfo += `- Type: ${wallet.type}\n\n`;
            });

            return walletInfo;
        } catch (error) {
            console.error("Error in Para wallet provider:", error);
            return "Error retrieving Para wallet information.";
        }
    },
};

export const paraProviders = [paraWalletProvider];