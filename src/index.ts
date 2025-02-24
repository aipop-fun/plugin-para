import { Plugin } from "@elizaos/core";
import { paraActions } from "./actions";
import { paraProviders } from "./providers";
import { ParaWalletService } from "./services/paraWalletService";
import { validateEnvironment } from "./environment";

export const paraPlugin: Plugin = {
    name: "para-wallet",
    description: "Para Wallet integration for Eliza",
    actions: paraActions,
    providers: paraProviders,
    services: [new ParaWalletService()],
    initialize: async (runtime: { getSetting: (key: string) => string | undefined; }) => {        
        validateEnvironment(runtime);
    }
};

export * from "./types";
export * from "./actions";
export * from "./providers";
export * from "./services/paraWalletService";