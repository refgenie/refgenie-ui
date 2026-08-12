import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';

import { useLocalBridgeStore } from './store';

/**
 * The local digest index: every genome and asset digest present on the
 * connected local refgenie, fetched once and cached. Presence badges are an
 * exact intersection of these digests with the remote listing's digests —
 * digests are content-derived and identical across instances, which is the
 * whole reason this feature is worth building (no fuzzy name matching).
 */

export type LocalDigestIndex = {
  genomeDigests: Set<string>;
  assetDigests: Set<string>;
};

const INDEX_QUERY_PREFIX = ['localBridge', 'digestIndex'] as const;

type DigestListing = {
  items?: { digest?: string }[];
  pagination?: { total?: number };
};

const collectDigests = async (url: string): Promise<Set<string>> => {
  const digests = new Set<string>();
  const limit = 500;
  let offset = 0;
  // Paginate defensively; a local instance is typically small, so this is
  // one request in practice. Hard cap keeps a pathological instance from
  // looping forever.
  for (let page = 0; page < 40; page++) {
    const { data } = await axios.get<DigestListing>(url, {
      params: { offset, limit },
      withCredentials: false,
    });
    const items = data?.items ?? [];
    for (const item of items) {
      if (typeof item?.digest === 'string') digests.add(item.digest);
    }
    offset += items.length;
    const total = data?.pagination?.total;
    if (items.length < limit || (typeof total === 'number' && offset >= total)) break;
  }
  return digests;
};

export const fetchLocalDigestIndex = async (baseUrl: string): Promise<LocalDigestIndex> => {
  const [genomeDigests, assetDigests] = await Promise.all([
    collectDigests(`${baseUrl}/v4/genomes`),
    collectDigests(`${baseUrl}/v4/assets`),
  ]);
  return { genomeDigests, assetDigests };
};

export const useLocalDigestIndex = () => {
  const { status, baseUrl } = useLocalBridgeStore();
  return useQuery({
    queryKey: [...INDEX_QUERY_PREFIX, baseUrl],
    queryFn: () => fetchLocalDigestIndex(baseUrl as string),
    enabled: status === 'connected' && !!baseUrl,
    staleTime: 60_000,
  });
};

/** Invalidate the index (e.g. after a successful pull) so presence badges
 * update immediately. */
export const useInvalidateLocalDigestIndex = () => {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: [...INDEX_QUERY_PREFIX] }),
    [queryClient],
  );
};
