import type { Address } from 'abitype'

import type { EstimateFeesPerGasReturnType } from '../actions/public/estimateFeesPerGas.js'
import type { PrepareTransactionRequestParameters } from '../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { Account } from '../types/account.js'
import type { FeeValuesType } from '../types/fee.js'
import type {
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../types/transaction.js'
import type { IsUndefined, Prettify } from '../types/utils.js'
import type { FormattedBlock } from '../utils/formatters/block.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'

export type Chain<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /** Collection of block explorers */
  blockExplorers?:
    | {
        [key: string]: ChainBlockExplorer
        default: ChainBlockExplorer
      }
    | undefined
  /** Collection of contracts */
  contracts?:
    | Prettify<
        {
          [key: string]:
            | ChainContract
            | { [sourceId: number]: ChainContract | undefined }
            | undefined
        } & {
          ensRegistry?: ChainContract | undefined
          ensUniversalResolver?: ChainContract | undefined
          multicall3?: ChainContract | undefined
        }
      >
    | undefined
  /** ID in number form */
  id: number
  /** Human-readable name */
  name: string
  /** Currency used by chain */
  nativeCurrency: ChainNativeCurrency
  /** Collection of RPC endpoints */
  rpcUrls: {
    [key: string]: ChainRpcUrls
    default: ChainRpcUrls
  }
  /** Source Chain ID (ie. the L1 chain) */
  sourceId?: number | undefined
  /** Flag for test networks */
  testnet?: boolean | undefined

  /**
   * Modifies how chain data structures (ie. Blocks, Transactions, etc)
   * are formatted & typed.
   */
  formatters?: formatters | undefined
  /** Modifies how data (ie. Transactions) is serialized. */
  serializers?: ChainSerializers<formatters> | undefined
  /** Modifies how fees are derived. */
  fees?: ChainFees<formatters | undefined> | undefined
}

/////////////////////////////////////////////////////////////////////
// Constants

type ChainBlockExplorer = {
  name: string
  url: string
}

export type ChainContract = {
  address: Address
  blockCreated?: number | undefined
}

type ChainNativeCurrency = {
  name: string
  /** 2-6 characters long */
  symbol: string
  decimals: number
}

type ChainRpcUrls = {
  http: readonly string[]
  webSocket?: readonly string[] | undefined
}

/////////////////////////////////////////////////////////////////////
// Config

export type ChainFees<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /**
   * The fee multiplier to use to account for fee fluctuations.
   * Used in the [`estimateFeesPerGas` Action](/docs/actions/public/estimateFeesPerGas).
   *
   * @default 1.2
   */
  baseFeeMultiplier?:
    | number
    | ((args: ChainFeesFnParameters<formatters>) => Promise<number> | number)
  /**
   * The default `maxPriorityFeePerGas` to use when a priority
   * fee is not defined upon sending a transaction.
   *
   * Overrides the return value in the [`estimateMaxPriorityFeePerGas` Action](/docs/actions/public/estimateMaxPriorityFeePerGas).
   */
  defaultPriorityFee?:
    | bigint
    | ((args: ChainFeesFnParameters<formatters>) => Promise<bigint> | bigint)
    | undefined
  /**
   * Allows customization of fee per gas values (e.g. `maxFeePerGas`/`maxPriorityFeePerGas`).
   *
   * Overrides the return value in the [`estimateFeesPerGas` Action](/docs/actions/public/estimateFeesPerGas).
   */
  estimateFeesPerGas?:
    | ((
        args: ChainEstimateFeesPerGasFnParameters<formatters>,
      ) => Promise<EstimateFeesPerGasReturnType>)
    | bigint
    | undefined
}

export type ChainFormatters = {
  /** Modifies how the Block structure is formatted & typed. */
  block?: ChainFormatter<'block'> | undefined
  /** Modifies how the Transaction structure is formatted & typed. */
  transaction?: ChainFormatter<'transaction'> | undefined
  /** Modifies how the TransactionReceipt structure is formatted & typed. */
  transactionReceipt?: ChainFormatter<'transactionReceipt'> | undefined
  /** Modifies how the TransactionRequest structure is formatted & typed. */
  transactionRequest?: ChainFormatter<'transactionRequest'> | undefined
}

export type ChainFormatter<type extends string = string> = {
  format: (args: any) => any
  type: type
}

export type ChainSerializers<
  formatters extends ChainFormatters | undefined = undefined,
> = {
  /** Modifies how Transactions are serialized. */
  transaction?:
    | SerializeTransactionFn<
        formatters extends ChainFormatters
          ? formatters['transactionRequest'] extends ChainFormatter
            ? TransactionSerializableGeneric &
                Parameters<formatters['transactionRequest']['format']>[0]
            : TransactionSerializable
          : TransactionSerializable
      >
    | undefined
}

/////////////////////////////////////////////////////////////////////
// Parameters

export type ChainFeesFnParameters<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /** The latest block. */
  block: Prettify<
    FormattedBlock<Omit<Chain, 'formatters'> & { formatters: formatters }>
  >
  client: Client<Transport, Chain>
  /**
   * A transaction request. This value will be undefined if the caller
   * is outside of a transaction request context (e.g. a direct call to
   * the `estimateFeesPerGas` Action).
   */
  request?:
    | PrepareTransactionRequestParameters<
        Omit<Chain, 'formatters'> & { formatters: formatters },
        Account | undefined,
        undefined
      >
    | undefined
}

export type ChainEstimateFeesPerGasFnParameters<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
> = {
  /**
   * A function to multiply the base fee based on the `baseFeeMultiplier` value.
   */
  multiply(x: bigint): bigint
  /**
   * The type of fees to return.
   */
  type: FeeValuesType
} & ChainFeesFnParameters<formatters>

/////////////////////////////////////////////////////////////////////
// Utils

export type ExtractChain<
  chains extends readonly Chain[],
  chainId extends Chain['id'],
> = Extract<chains[number], { id: chainId }>

export type ExtractChainFormatterExclude<
  chain extends Chain | undefined,
  type extends keyof ChainFormatters,
> = chain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[type] extends { exclude: infer Exclude }
    ? Extract<Exclude, string[]>[number]
    : ''
  : ''

export type ExtractChainFormatterParameters<
  chain extends Chain | undefined,
  type extends keyof ChainFormatters,
  fallback,
> = chain extends { formatters?: infer _Formatters extends ChainFormatters }
  ? _Formatters[type] extends ChainFormatter
    ? Parameters<_Formatters[type]['format']>[0]
    : fallback
  : fallback

export type ExtractChainFormatterReturnType<
  chain extends Chain | undefined,
  type extends keyof ChainFormatters,
  fallback,
> = chain extends {
  formatters?:
    | { [_ in type]?: infer formatter extends ChainFormatter }
    | undefined
}
  ? chain['formatters'] extends undefined
    ? fallback
    : ReturnType<formatter['format']>
  : fallback

export type DeriveChain<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined,
> = chainOverride extends Chain ? chainOverride : chain

export type GetChainParameter<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = IsUndefined<chain> extends true
  ? { chain: chainOverride | null }
  : { chain?: chainOverride | null | undefined }
