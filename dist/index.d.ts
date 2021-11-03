import { BaseProvider } from '@ethersproject/providers';
import { BigNumber } from 'bignumber.js';

declare function scale(input: BigNumber, decimalPlaces: number): BigNumber;
declare function bnum(val: string | number | BigNumber): BigNumber;

declare type NoNullableField<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};
declare enum SwapTypes {
    SwapExactIn = 0,
    SwapExactOut = 1,
}
declare enum PoolTypes {
    Weighted = 0,
    Stable = 1,
    Element = 2,
    MetaStable = 3,
}
declare enum SwapPairType {
    Direct = 0,
    HopIn = 1,
    HopOut = 2,
}
interface SwapOptions {
    gasPrice: BigNumber;
    swapGas: BigNumber;
    timestamp: number;
    maxPools: number;
    poolTypeFilter: PoolFilter;
    forceRefresh: boolean;
}
declare type PoolPairBase = {
    id: string;
    address: string;
    poolType: PoolTypes;
    swapFee: BigNumber;
    tokenIn: string;
    tokenOut: string;
    decimalsIn: number;
    decimalsOut: number;
    balanceIn: BigNumber;
    balanceOut: BigNumber;
};
interface Swap {
    pool: string;
    tokenIn: string;
    tokenOut: string;
    swapAmount?: string;
    limitReturnAmount?: string;
    maxPrice?: string;
    tokenInDecimals: number;
    tokenOutDecimals: number;
}
interface SubgraphPoolBase {
    id: string;
    address: string;
    poolType: string;
    swapFee: string;
    totalShares: string;
    tokens: SubgraphToken[];
    tokensList: string[];
    totalWeight?: string;
    amp?: string;
    expiryTime?: number;
    unitSeconds?: number;
    principalToken?: string;
    baseToken?: string;
    swapEnabled?: boolean;
}
interface SubGraphPoolsBase {
    pools: SubgraphPoolBase[];
}
declare type SubgraphToken = {
    address: string;
    balance: string;
    decimals: number;
    priceRate: string;
    weight: string | null;
};
interface SwapV2 {
    poolId: string;
    assetInIndex: number;
    assetOutIndex: number;
    amount: string;
    userData: string;
}
interface SwapInfo {
    tokenAddresses: string[];
    swaps: SwapV2[];
    swapAmount: BigNumber;
    swapAmountForSwaps?: BigNumber;
    returnAmount: BigNumber;
    returnAmountFromSwaps?: BigNumber;
    returnAmountConsideringFees: BigNumber;
    tokenIn: string;
    tokenOut: string;
    marketSp: BigNumber;
}
interface PoolDictionary {
    [poolId: string]: PoolBase;
}
interface PoolPairDictionary {
    [tokenInOut: string]: PoolPairBase;
}
interface NewPath {
    id: string;
    swaps: Swap[];
    poolPairData: PoolPairBase[];
    limitAmount: BigNumber;
    pools: PoolBase[];
    filterEffectivePrice?: BigNumber;
}
declare enum PoolFilter {
    All = 'All',
    Weighted = 'Weighted',
    Stable = 'Stable',
    MetaStable = 'MetaStable',
    LBP = 'LiquidityBootstrapping',
}
interface PoolBase {
    poolType: PoolTypes;
    swapPairType: SwapPairType;
    id: string;
    address: string;
    tokensList: string[];
    parsePoolPairData: (tokenIn: string, tokenOut: string) => PoolPairBase;
    getNormalizedLiquidity: (poolPairData: PoolPairBase) => BigNumber;
    getLimitAmountSwap: (
        poolPairData: PoolPairBase,
        swapType: SwapTypes
    ) => BigNumber;
    updateTokenBalanceForPool: (token: string, newBalance: BigNumber) => void;
    _exactTokenInForTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber,
        exact: boolean
    ) => BigNumber;
    _tokenInForExactTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber,
        exact: boolean
    ) => BigNumber;
    _spotPriceAfterSwapExactTokenInForTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber
    ) => BigNumber;
    _spotPriceAfterSwapTokenInForExactTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber
    ) => BigNumber;
    _derivativeSpotPriceAfterSwapExactTokenInForTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber
    ) => BigNumber;
    _derivativeSpotPriceAfterSwapTokenInForExactTokenOut: (
        poolPairData: PoolPairBase,
        amount: BigNumber
    ) => BigNumber;
}
interface WeightedPool$1 extends PoolBase {
    totalWeight: string;
}

declare class PoolCacher {
    private provider;
    private chainId;
    private poolsUrl;
    private pools;
    finishedFetchingOnChain: boolean;
    constructor(
        provider: BaseProvider,
        chainId: number,
        poolsUrl?: string | null,
        initialPools?: SubgraphPoolBase[]
    );
    getPools(): SubgraphPoolBase[];
    isConnectedToSubgraph(): boolean;
    fetchPools(
        poolsData?: SubgraphPoolBase[],
        isOnChain?: boolean
    ): Promise<boolean>;
    private fetchOnChainBalances;
}

declare class SwapCostCalculator {
    private provider;
    private chainId;
    private tokenPriceCache;
    private initializeCache;
    constructor(provider: BaseProvider, chainId: number);
    /**
     * Sets the chain ID to be used when querying asset prices
     * @param chainId - the chain ID of the chain to switch to
     */
    setChainId(chainId: number): void;
    /**
     * @param tokenAddress - the address of the token for which to express the native asset in terms of
     */
    getNativeAssetPriceInToken(tokenAddress: string): Promise<BigNumber>;
    /**
     * @param tokenAddress - the address of the token for which to express the native asset in terms of
     * @param tokenPrice - the price of the native asset in terms of the provided token
     */
    setNativeAssetPriceInToken(tokenAddress: string, tokenPrice: string): void;
    /**
     * Calculate the cost of spending a certain amount of gas in terms of a token.
     * This allows us to determine whether an increased amount of tokens gained
     * is worth spending this extra gas (e.g. by including an extra pool in a swap)
     */
    convertGasCostToToken(
        tokenAddress: string,
        gasPriceWei: BigNumber,
        swapGas?: BigNumber
    ): Promise<BigNumber>;
}

declare class SOR {
    provider: BaseProvider;
    chainId: number;
    poolCacher: PoolCacher;
    private routeProposer;
    swapCostCalculator: SwapCostCalculator;
    private readonly defaultSwapOptions;
    constructor(
        provider: BaseProvider,
        chainId: number,
        poolsSource: string | null,
        initialPools?: SubgraphPoolBase[]
    );
    getPools(): SubgraphPoolBase[];
    fetchPools(
        poolsData?: SubgraphPoolBase[],
        isOnChain?: boolean
    ): Promise<boolean>;
    getSwaps(
        tokenIn: string,
        tokenOut: string,
        swapType: SwapTypes,
        swapAmount: BigNumber,
        swapOptions?: Partial<SwapOptions>
    ): Promise<SwapInfo>;
    getCostOfSwapInToken(
        outputToken: string,
        gasPrice: BigNumber,
        swapGas?: BigNumber
    ): Promise<BigNumber>;
    private processSwaps;
    /**
     * Find optimal routes for trade from given candidate paths
     */
    private getBestPaths;
}

declare function BPTForTokensZeroPriceImpact$1(
    balances: BigNumber[],
    decimals: number[],
    normalizedWeights: BigNumber[],
    amounts: BigNumber[],
    bptTotalSupply: BigNumber
): BigNumber;

declare function BPTForTokensZeroPriceImpact(
    allBalances: BigNumber[],
    decimals: number[],
    amounts: BigNumber[], // This has to have the same lenght as allBalances
    bptTotalSupply: BigNumber,
    amp: BigNumber
): BigNumber;

declare const WETHADDR: {
    [chainId: number]: string;
};
declare const MULTIADDR: {
    [chainId: number]: string;
};
declare const VAULTADDR: {
    [chainId: number]: string;
};
declare const EMPTY_SWAPINFO: SwapInfo;

declare function fetchSubgraphPools(
    subgraphUrl: string
): Promise<SubgraphPoolBase[]>;

declare function getOnChainBalances(
    subgraphPools: SubgraphPoolBase[],
    multiAddress: string,
    vaultAddress: string,
    provider: BaseProvider
): Promise<SubgraphPoolBase[]>;

declare const PRICE_ERROR_TOLERANCE: BigNumber;
declare const INFINITESIMAL: BigNumber;

declare type WeightedPoolToken = Pick<
    NoNullableField<SubgraphToken>,
    'address' | 'balance' | 'decimals' | 'weight'
>;
declare type WeightedPoolPairData = PoolPairBase & {
    weightIn: BigNumber;
    weightOut: BigNumber;
};
declare class WeightedPool implements PoolBase {
    poolType: PoolTypes;
    swapPairType: SwapPairType;
    id: string;
    address: string;
    swapFee: BigNumber;
    totalShares: string;
    tokens: WeightedPoolToken[];
    totalWeight: BigNumber;
    tokensList: string[];
    MAX_IN_RATIO: BigNumber;
    MAX_OUT_RATIO: BigNumber;
    static fromPool(pool: SubgraphPoolBase): WeightedPool;
    constructor(
        id: string,
        address: string,
        swapFee: string,
        totalWeight: string,
        totalShares: string,
        tokens: WeightedPoolToken[],
        tokensList: string[]
    );
    setTypeForSwap(type: SwapPairType): void;
    parsePoolPairData(tokenIn: string, tokenOut: string): WeightedPoolPairData;
    getNormalizedLiquidity(poolPairData: WeightedPoolPairData): BigNumber;
    getLimitAmountSwap(
        poolPairData: PoolPairBase,
        swapType: SwapTypes
    ): BigNumber;
    updateTokenBalanceForPool(token: string, newBalance: BigNumber): void;
    _exactTokenInForTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _tokenInForExactTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _spotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _spotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: WeightedPoolPairData,
        amount: BigNumber
    ): BigNumber;
}

declare type StablePoolToken = Pick<
    SubgraphToken,
    'address' | 'balance' | 'decimals'
>;
declare type StablePoolPairData = PoolPairBase & {
    swapFeeScaled: BigNumber;
    allBalances: BigNumber[];
    allBalancesScaled: BigNumber[];
    invariant: BigNumber;
    amp: BigNumber;
    tokenIndexIn: number;
    tokenIndexOut: number;
};
declare class StablePool implements PoolBase {
    poolType: PoolTypes;
    swapPairType: SwapPairType;
    id: string;
    address: string;
    amp: BigNumber;
    swapFee: BigNumber;
    swapFeeScaled: BigNumber;
    totalShares: string;
    tokens: StablePoolToken[];
    tokensList: string[];
    AMP_PRECISION: BigNumber;
    MAX_IN_RATIO: BigNumber;
    MAX_OUT_RATIO: BigNumber;
    ampAdjusted: BigNumber;
    static fromPool(pool: SubgraphPoolBase): StablePool;
    constructor(
        id: string,
        address: string,
        amp: string,
        swapFee: string,
        totalShares: string,
        tokens: StablePoolToken[],
        tokensList: string[]
    );
    setTypeForSwap(type: SwapPairType): void;
    parsePoolPairData(tokenIn: string, tokenOut: string): StablePoolPairData;
    getNormalizedLiquidity(poolPairData: StablePoolPairData): BigNumber;
    getLimitAmountSwap(
        poolPairData: PoolPairBase,
        swapType: SwapTypes
    ): BigNumber;
    updateTokenBalanceForPool(token: string, newBalance: BigNumber): void;
    _exactTokenInForTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _tokenInForExactTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _spotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber
    ): BigNumber;
    _spotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: StablePoolPairData,
        amount: BigNumber
    ): BigNumber;
}

declare type ElementPoolToken = Pick<
    SubgraphToken,
    'address' | 'balance' | 'decimals'
>;
declare type ElementPoolPairData = PoolPairBase & {
    totalShares: BigNumber;
    expiryTime: number;
    unitSeconds: number;
    principalToken: string;
    baseToken: string;
    currentBlockTimestamp: number;
};
declare class ElementPool implements PoolBase {
    poolType: PoolTypes;
    swapPairType: SwapPairType;
    id: string;
    address: string;
    swapFee: string;
    totalShares: string;
    tokens: ElementPoolToken[];
    tokensList: string[];
    expiryTime: number;
    unitSeconds: number;
    principalToken: string;
    baseToken: string;
    currentBlockTimestamp: number;
    static fromPool(pool: SubgraphPoolBase): ElementPool;
    constructor(
        id: string,
        address: string,
        swapFee: string,
        totalShares: string,
        tokens: ElementPoolToken[],
        tokensList: string[],
        expiryTime: number,
        unitSeconds: number,
        principalToken: string,
        baseToken: string
    );
    setCurrentBlockTimestamp(timestamp: number): void;
    setTypeForSwap(type: SwapPairType): void;
    parsePoolPairData(tokenIn: string, tokenOut: string): ElementPoolPairData;
    getNormalizedLiquidity(poolPairData: ElementPoolPairData): BigNumber;
    getLimitAmountSwap(
        poolPairData: ElementPoolPairData,
        swapType: SwapTypes
    ): BigNumber;
    updateTokenBalanceForPool(token: string, newBalance: BigNumber): void;
    _exactTokenInForTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _tokenInForExactTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber,
        exact: boolean
    ): BigNumber;
    _spotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _spotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapExactTokenInForTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber
    ): BigNumber;
    _derivativeSpotPriceAfterSwapTokenInForExactTokenOut(
        poolPairData: ElementPoolPairData,
        amount: BigNumber
    ): BigNumber;
}

declare function parseNewPool(
    pool: SubgraphPoolBase,
    currentBlockTimestamp?: number
): WeightedPool | StablePool | ElementPool | undefined;
declare function getOutputAmountSwap(
    pool: PoolBase,
    poolPairData: PoolPairBase,
    swapType: SwapTypes,
    amount: BigNumber
): BigNumber;

declare const Lido: {
    Networks: number[];
    stETH: {
        1: string;
        42: string;
    };
    wstETH: {
        1: string;
        42: string;
    };
    WETH: {
        1: string;
        42: string;
    };
    DAI: {
        1: string;
        42: string;
    };
    USDC: {
        1: string;
        42: string;
    };
    USDT: {
        1: string;
        42: string;
    };
    StaticPools: {
        staBal: {
            1: string;
            42: string;
        };
        wethDai: {
            1: string;
            42: string;
        };
        wstEthWeth: {
            1: string;
            42: string;
        };
    };
};
declare const Routes: {
    1: {};
    42: {};
};
declare function isLidoStableSwap(
    chainId: number,
    tokenIn: string,
    tokenOut: string
): boolean;
declare function getStEthRate(
    provider: BaseProvider,
    chainId: number
): Promise<BigNumber>;
declare function getLidoStaticSwaps(
    pools: SubgraphPoolBase[],
    chainId: number,
    tokenIn: string,
    tokenOut: string,
    swapType: SwapTypes,
    swapAmount: BigNumber,
    provider: BaseProvider
): Promise<SwapInfo>;

declare const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export {
    BPTForTokensZeroPriceImpact$1 as BPTForTokensZeroPriceImpact,
    EMPTY_SWAPINFO,
    INFINITESIMAL,
    Lido,
    MULTIADDR,
    NewPath,
    NoNullableField,
    PRICE_ERROR_TOLERANCE,
    PoolBase,
    PoolDictionary,
    PoolFilter,
    PoolPairBase,
    PoolPairDictionary,
    PoolTypes,
    Routes,
    SOR,
    SubGraphPoolsBase,
    SubgraphPoolBase,
    SubgraphToken,
    Swap,
    SwapInfo,
    SwapOptions,
    SwapPairType,
    SwapTypes,
    SwapV2,
    VAULTADDR,
    WETHADDR,
    WeightedPool$1 as WeightedPool,
    ZERO_ADDRESS,
    bnum,
    fetchSubgraphPools,
    getLidoStaticSwaps,
    getOnChainBalances,
    getOutputAmountSwap,
    getStEthRate,
    isLidoStableSwap,
    parseNewPool,
    scale,
    BPTForTokensZeroPriceImpact as stableBPTForTokensZeroPriceImpact,
    BPTForTokensZeroPriceImpact$1 as weightedBPTForTokensZeroPriceImpact,
};
