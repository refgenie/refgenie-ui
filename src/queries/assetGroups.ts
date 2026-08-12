import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../services/api';
import type { ApiClient } from '../services/api';

export const getAssetGroups = async (
  api: ApiClient,
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
  const url = `${api.baseUrl}/asset_groups`;

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
  const api = useApiClient();
  return useQuery({
    queryKey: [
      api.baseUrl,
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
        api,
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
