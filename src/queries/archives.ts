import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getArchives = async (digest?: string, genomeDigest?: string, assetGroupName ?: string, assetName?: string) => {
  const url = `${API_BASE}/archives`;

  const params: any = {};
  if (digest) params.digest = digest;
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (assetGroupName) params.asset_group_name = assetGroupName;
  if (assetName) params.asset_name = assetName;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useArchives = (digest?: string, genomeDigest?: string, assetGroupName ?: string, assetName?: string) => {
  return useQuery({
    queryKey: ['archives', digest, genomeDigest, assetGroupName, assetName],
    queryFn: () => getArchives(digest, genomeDigest, assetGroupName, assetName),
  });
};
