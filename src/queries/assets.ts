import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';


export const getAsset = async (assetDigest?: string) => {
  const url = `${API_BASE}/assets/${assetDigest}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getAssets = async (name?: string, assetGroupName ?: string, genomeDigest?: string, recipeName?: string, assetGroupID?: number) => {
  const url = `${API_BASE}/assets`;

  const params: any = {};
  if (name) params.name = name;
  if (assetGroupName) params.asset_group_name = assetGroupName;
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (recipeName) params.recipe_name = recipeName;
  if (assetGroupID) params.asset_group_id = assetGroupID;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const getAssetFiles = async (digest: string) => {
  const url = `${API_BASE}/assets/${digest}/files`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const useAsset = (assetDigest?: string) => {
  return useQuery({
    queryKey: ['assets', assetDigest],
    queryFn: () => getAsset(assetDigest),
  });
};

export const useAssets = (name?: string, assetGroupName ?: string, genomeDigest?: string, recipeName?: string, assetGroupID?: number) => {
  return useQuery({
    queryKey: ['assets', name, assetGroupName, genomeDigest, recipeName, assetGroupID],
    queryFn: () => getAssets(name, assetGroupName, genomeDigest, recipeName, assetGroupID),
  });
};

export const useAssetFiles = (digest: string) => {
  return useQuery({
    queryKey: ['assets', digest],
    queryFn: () => getAssetFiles(digest),
  });
};
