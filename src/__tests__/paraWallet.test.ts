import { AgentRuntime } from "@elizaos/core";
import { ParaWalletService } from "../services/paraWalletService";

// Mock Para SDK
jest.mock("@getpara/web-sdk", () => {
    return jest.fn().mockImplementation(() => {
        return {
            createWallet: jest.fn().mockResolvedValue({
                id: "mock-wallet-id",
                address: "0x1234567890123456789012345678901234567890",
                type: "EVM"
            }),
            getWallets: jest.fn().mockResolvedValue({
                "mock-wallet-id": {
                    id: "mock-wallet-id",
                    address: "0x1234567890123456789012345678901234567890",
                    type: "EVM"
                }
            }),
            signMessage: jest.fn().mockResolvedValue("0xsignature"),
            hasPregenWallet: jest.fn().mockResolvedValue(false),
            createPregenWallet: jest.fn().mockResolvedValue({
                id: "mock-pregen-wallet-id",
                address: "0x1234567890123456789012345678901234567890",
                type: "EVM"
            }),
            getUserShare: jest.fn().mockResolvedValue("mock-user-share")
        };
    });
});

// Mock Viem
jest.mock("viem", () => {
    return {
        createWalletClient: jest.fn().mockReturnValue({
            sendTransaction: jest.fn().mockResolvedValue("0xmocktxhash")
        }),
        createPublicClient: jest.fn().mockReturnValue({
            waitForTransactionReceipt: jest.fn().mockResolvedValue({
                status: "success",
                blockNumber: 12345678n
            })
        }),
        http: jest.fn().mockReturnValue("mock-transport"),
        parseEther: jest.fn().mockImplementation((value) => BigInt(value))
    };
});

// Mock Para Viem integration
jest.mock("@getpara/viem-integration", () => {
    return {
        ParaConnector: jest.fn().mockImplementation(() => {
            return {
                connect: jest.fn().mockResolvedValue({
                    account: "0x1234567890123456789012345678901234567890",
                    chain: { id: 1 }
                })
            };
        })
    };
});

// Mock runtime
const mockRuntime = {
    getSetting: jest.fn((key) => {
        if (key === "PARA_API_KEY") return "mock-api-key";
        if (key === "PARA_ENV") return "production";
        return null;
    }),
    getService: jest.fn(),
} as unknown as AgentRuntime;

describe("ParaWalletService", () => {
    let service: ParaWalletService;

    beforeEach(() => {
        service = new ParaWalletService();
        jest.clearAllMocks();
    });

    it("should initialize correctly", async () => {
        await service.initialize(null, mockRuntime);
        expect(service["initialized"]).toBe(true);
        expect(service.paraInstance).not.toBeNull();
    });

    it("should create a wallet", async () => {
        await service.initialize(null, mockRuntime);
        const wallet = await service.createWallet();

        expect(wallet).toEqual({
            id: "mock-wallet-id",
            address: "0x1234567890123456789012345678901234567890",
            type: "EVM"
        });
    });

    it("should create a pregenerated wallet", async () => {
        await service.initialize(null, mockRuntime);
        const result = await service.createPregenWallet({
            pregenIdentifier: "user@example.com",
            pregenIdentifierType: "EMAIL"
        });

        expect(result).toEqual({
            wallet: {
                id: "mock-pregen-wallet-id",
                address: "0x1234567890123456789012345678901234567890",
                type: "EVM"
            },
            userShare: "mock-user-share"
        });
    });

    it("should sign messages", async () => {
        await service.initialize(null, mockRuntime);
        const signature = await service.signMessage({
            walletId: "mock-wallet-id",
            message: "Hello World"
        });

        expect(signature).toBe("0xsignature");
    });

    it("should sign transactions", async () => {
        await service.initialize(null, mockRuntime);
        const result = await service.signTransaction({
            walletId: "mock-wallet-id",
            transaction: {
                to: "0x1234567890123456789012345678901234567890",
                value: "0.01"
            },
            chainId: "1"
        });

        expect(result).toEqual({
            hash: "0xmocktxhash",
            receipt: {
                status: "success",
                blockNumber: 12345678n
            }
        });
    });
});