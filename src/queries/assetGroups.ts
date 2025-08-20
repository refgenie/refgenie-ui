import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getAssetGroup = async (assetGroupID?: number) => {
  const url = `${API_BASE}/asset_groups/${assetGroupID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getAssetGroups = async (
  genomeDigest?: string,
  assetClass?: string,
  assetGroupName?: string,
  assetGroupID?: number,
) => {
  const url = `${API_BASE}/asset_groups`;

  const params: any = {};
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (assetClass) params.asset_class = assetClass;
  if (assetGroupName) params.asset_group_name = assetGroupName;
  if (assetGroupID) params.asset_group_id = assetGroupID;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAssetGroup = (assetGroupID?: number) => {
  return useQuery({
    queryKey: ['assetGroups', assetGroupID],
    queryFn: () => getAssetGroup(assetGroupID),
  });
};

export const useAssetGroups = (
  genomeDigest?: string,
  assetClass?: string,
  assetGroupName?: string,
  assetGroupID?: number,
) => {
  return useQuery({
    queryKey: [
      'assetGroups',
      genomeDigest,
      assetClass,
      assetGroupName,
      assetGroupID,
    ],
    queryFn: () =>
      getAssetGroups(genomeDigest, assetClass, assetGroupName, assetGroupID),
  });
};
