import { ConfigManagerV2 } from '../../services/config-manager-v2';
import { AvailableNetworks } from '../../services/config-manager-types';
export namespace SMBswapConfig {
  export interface NetworkConfig {
    allowedSlippage: string;
    gasLimitEstimate: number;
    ttl: number;
    maximumHops: number;
    smbswapV3SmartOrderRouterAddress: (network: string) => string;
    smbswapV3NftManagerAddress: (network: string) => string;
    tradingTypes: (type: string) => Array<string>;
    availableNetworks: Array<AvailableNetworks>;
  }

  export const config: NetworkConfig = {
    allowedSlippage: ConfigManagerV2.getInstance().get(
      `smbswap.allowedSlippage`
    ),
    gasLimitEstimate: ConfigManagerV2.getInstance().get(
      `smbswap.gasLimitEstimate`
    ),
    ttl: ConfigManagerV2.getInstance().get(`smbswap.ttl`),
    maximumHops: ConfigManagerV2.getInstance().get(`smbswap.maximumHops`),
    smbswapV3SmartOrderRouterAddress: (network: string) =>
      ConfigManagerV2.getInstance().get(
        `smbswap.contractAddresses.${network}.smbswapV3SmartOrderRouterAddress`
      ),
    smbswapV3NftManagerAddress: (network: string) =>
      ConfigManagerV2.getInstance().get(
        `smbswap.contractAddresses.${network}.smbswapV3NftManagerAddress`
      ),
    tradingTypes: (type: string) => {
      return type === 'swap' ? ['EVM_AMM'] : ['EVM_AMM_LP'];
    },
    availableNetworks: [
      {
        chain: 'ethereum',
        networks: Object.keys(
          ConfigManagerV2.getInstance().get('smbswap.contractAddresses')
        ).filter((network) =>
          Object.keys(
            ConfigManagerV2.getInstance().get('ethereum.networks')
          ).includes(network)
        ),
      },
      {
        chain: 'polygon',
        networks: Object.keys(
          ConfigManagerV2.getInstance().get('smbswap.contractAddresses')
        ).filter((network) =>
          Object.keys(
            ConfigManagerV2.getInstance().get('polygon.networks')
          ).includes(network)
        ),
      },
    ],
  };
}
