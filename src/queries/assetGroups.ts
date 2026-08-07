import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getAssetGroups = async (
  genomeDigest?: string,
  assetClass?: string,
  assetGroupName?: string,
  assetGroupID?: number,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  const url = `${API_BASE}/asset_groups`;

  const params: any = {};
  if (genomeDigest) params.genome_digest = genomeDigest;
  if (assetClass) params.asset_class = assetClass;
  if (assetGroupName) params.asset_group_name = assetGroupName;
  if (assetGroupID) params.asset_group_id = assetGroupID;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAssetGroups = (
  genomeDigest?: string,
  assetClass?: string,
  assetGroupName?: string,
  assetGroupID?: number,
  query?: string,
  searchFields?: string,
  operator?: string,
  offset?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: [
      'assetGroups',
      genomeDigest,
      assetClass,
      assetGroupName,
      assetGroupID,
      query,
      searchFields,
      operator,
      offset,
      limit,
    ],
    queryFn: () =>
      getAssetGroups(
        genomeDigest,
        assetClass,
        assetGroupName,
        assetGroupID,
        query,
        searchFields,
        operator,
        offset,
        limit,
      ),
  });
};
