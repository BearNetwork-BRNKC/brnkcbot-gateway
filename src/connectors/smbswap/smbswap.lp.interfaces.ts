import { CurrencyAmount, Percent, Token } from '@smbswap/sdk-core';
import * as smbV3 from '@smbswap/v3-sdk';
import { BigNumber } from 'ethers';

export interface PoolState {
  liquidity: BigNumber;
  sqrtPriceX96: BigNumber;
  tick: number;
  observationIndex: BigNumber;
  observationCardinality: BigNumber;
  observationCardinalityNext: BigNumber;
  feeProtocol: BigNumber;
  unlocked: boolean;
  fee: smbV3.FeeAmount;
  tickProvider: {
    index: number;
    liquidityNet: BigNumber;
    liquidityGross: BigNumber;
  }[];
}

export interface RawPosition {
  nonce: number;
  operator: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: number;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  tokensOwed0: BigNumber;
  tokensOwed1: BigNumber;
}

export interface AddPosReturn extends smbV3.MethodParameters {
  swapRequired: boolean;
}

export interface ReduceLiquidityData {
  tokenId: number;
  liquidityPercentage: Percent;
  slippageTolerance: Percent;
  deadline: number;
  burnToken: boolean;
  collectOptions: {
    expectedCurrencyOwed0: CurrencyAmount<Token>;
    expectedCurrencyOwed1: CurrencyAmount<Token>;
    recipient: string;
  };
}
