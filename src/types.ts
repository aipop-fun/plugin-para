export interface ParaWallet {
    id: string;
    address: string;
    type: string;
}

export interface ParaWalletCreateParams {
    type?: string;
}

export interface ParaMessageSignParams {
    walletId: string;
    message: string;
}

export interface ParaTransactionSignParams {
    walletId: string;
    transaction: any;
    chainId: string;
}

export interface ParaPregenWalletParams {
    pregenIdentifier: string;
    pregenIdentifierType: string;
}