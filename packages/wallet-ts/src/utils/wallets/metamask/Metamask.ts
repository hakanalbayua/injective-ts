import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import { WalletException } from '@injectivelabs/exceptions'
import { EthereumChainId } from '@injectivelabs/ts-types'
import { Eip1993ProviderWithMetamask } from '../../../strategies/wallet-strategy/types'

export const getEthersProviderFromMetamask = async () => {
  try {
    const provider = await detectEthereumProvider({
      mustBeMetaMask: true,
    })

    if (!provider) {
      throw new WalletException(new Error('Please install Metamask Extension'))
    }

    return new ethers.providers.Web3Provider(provider, 'any')
  } catch (e) {
    throw new WalletException(new Error('Please install Metamask Extension'))
  }
}

export const updateMetamaskNetwork = async (chainId: EthereumChainId) => {
  try {
    const provider = (await detectEthereumProvider({
      mustBeMetaMask: true,
    })) as Eip1993ProviderWithMetamask

    if (!provider) {
      throw new WalletException(new Error('Please install Metamask Extension'))
    }

    const chainIdToHex = chainId.toString(16)

    return await Promise.race([
      provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainIdToHex}` }],
      }),
      new Promise<void>((resolve) =>
        provider.on('change', ({ chain }: any) => {
          if (chain?.id === chainIdToHex) {
            resolve()
          }
        }),
      ),
    ])
  } catch (e) {
    throw new WalletException(new Error('Please update your Metamask network'))
  }
}
