import { Connection, PublicKey } from '@solana/web3.js'
import { useAppStore, useLaunchpadStore } from '@/store'
import useSWR from 'swr'
import ToPublicKey from '@/utils/publicKey'
import { useEffect, useMemo, useState } from 'react'
import { PlatformConfig } from '@raydium-io/raydium-sdk-v2'

interface Props {
  shouldFetch?: boolean
  platformId?: PublicKey
  refreshInterval?: number
}

const fetcher = ([connection, id]: [Connection, string]) => connection.getAccountInfo(ToPublicKey(id))

export function usePlatformInfo({ shouldFetch = true, platformId, refreshInterval = 2 * 60 * 60 * 1000 }: Props) {
  // const raydium = useAppStore(s => s.raydium)

  // const [platformInfo, setPlatformInfo] = useState<any>()
  // const [epochInfo, setEpochInfo] = useState<any>()
  // const [slot, setSlot] = useState<number>(0)
  // useEffect(() => {
  //   const getAccountInfo = async () => {
  //     if (raydium && platformId) {
  //       const data = await raydium.connection.getAccountInfo(platformId)
  //       const platformInfo = PlatformConfig.decode(data!.data)
  //       setPlatformInfo(platformInfo)

  //       const epochInfo = await raydium.connection.getEpochInfo()
  //       setEpochInfo(epochInfo)

  //       const _slot = await raydium?.connection.getSlot() || 0
  //       setSlot(_slot)
  //     }
  //   }
  //   getAccountInfo()
  // }, [platformId])
  

  const connection = useAppStore((s) => s.connection)

  const { data } = useSWR(shouldFetch && connection && platformId ? [connection, platformId.toBase58()] : null, fetcher, {
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval,
    refreshInterval
  })

  const info = useMemo(() => {
    if (!data) return
    return PlatformConfig.decode(data.data)
  }, [data])

  return info
}
