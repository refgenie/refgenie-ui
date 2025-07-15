import axios from 'axios';
import { useQuery, useQueries } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || '';


export const getArchives = async (digest?: string, assetDigest?: string) => {
  const url = `${API_BASE}/archives`;

  const params: any = {};
  if (digest) params.digest = digest;
  if (assetDigest) params.asset_digest = assetDigest;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useArchives = (digest?: string, assetDigest?: string) => {
  return useQuery({
    queryKey: ['archives', digest, assetDigest],
    queryFn: () => getArchives(digest, assetDigest),
  });
};

export const useAssetArchives = (assetDigests: string[] = []) => {
  return useQueries({
    queries: assetDigests.map(assetDigest => ({
      queryKey: ['archives', assetDigest],
      queryFn: () => getArchives(undefined, assetDigest),
    }))
  });
};
