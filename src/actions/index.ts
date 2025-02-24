import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { ExtendedServiceType, ParaWalletService } from "../services/paraWalletService";
import { createWalletAction } from "./createWallet";
import { signMessageAction } from "./signMessage";
import { signTransactionAction } from "./signTransaction";

// Export all actions
export const paraActions: Action[] = [
    createWalletAction,
    signMessageAction,
    signTransactionAction,
];

// Helper function to get Para wallet service
export function getParaWalletService(runtime: IAgentRuntime): ParaWalletService {
    const service = runtime.getService<ParaWalletService>(
        ExtendedServiceType.PARA_WALLET
    );

    if (!service) {
        throw new Error("Para Wallet Service not available");
    }

    return service;
}

export * from "./createWallet";
export * from "./signMessage";
export * from "./signTransaction";