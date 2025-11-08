import { useAppStore, useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import axios from '@/api/axios'
import { MintInfo } from '@/features/Launchpad/type'
import ToPublicKey from '@/utils/publicKey'
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

export const mintInfoFetcher = (
  url: string
): Promise<{
  id: string
  success: boolean
  msg?: string
  data: {
    rows: MintInfo[]
  }
}> => axios.get(url, { skipError: true })

export default function useMintInfo({
  mints = [],
  refreshInterval = 30 * 1000
}: {
  mints: (string | undefined)[]
  refreshInterval?: number
}) {
  const mintHost = useLaunchpadStore((s) => s.mintHost)
  const mintQuery = mints
    .filter((m) => {
      if (!m) return false
      try {
        return ToPublicKey(m)
      } catch {
        return false
      }
    })
    .join(',')

  const { data, ...rest } = useSWR(mintQuery ? `${mintHost}/get/by/mints?ids=${mintQuery}` : null, mintInfoFetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    keepPreviousData: true
  })
  // const [mintInfo, setMintInfo] = useState<ApiV3Token | undefined>()
  // const raydium = useAppStore(s => s.raydium)
  // useEffect(() => {
  //   const getTokenInfo = async () => {
  //     if (raydium && mints[0]) {
  //       const mintInfo = await raydium.token.getTokenInfo(new PublicKey(mints[0]))
  //       setMintInfo(mintInfo)
  //     }
      
  //   }
  //   getTokenInfo()
  // }, [raydium, mints])

  const isEmptyResult = !!mintQuery && !rest.isLoading && !(data?.data.rows.length && !rest.error)

  return {
    data: data?.data.rows || [],
    isEmptyResult,
    ...rest
  }
}
