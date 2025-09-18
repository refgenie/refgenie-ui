import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getAssetClass = async (assetClassID?: string) => {
  const url = `${API_BASE}/asset_classes/${assetClassID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getAssetClasses = async (name?: string, version?: string, query?: string, searchFields?: string, operator?: string, offset?: number, limit?: number) => {
  const url = `${API_BASE}/asset_classes`;

  const params: any = {};
  if (name) params.name = name;
  if (version) params.version = version;
  if (query) params.q = query;
  if (searchFields) params.search_fields = searchFields;
  if (operator) params.operator = operator;
  if (offset) params.offset = offset;
  if (limit) params.limit = limit;

  const { data } = await axios.get<any>(url, { params });
  return data;
};

export const useAssetClass = (assetClassID?: string) => {
  return useQuery({
    queryKey: ['assetClass', assetClassID],
    queryFn: () => getAssetClass(assetClassID),
  });
};

export const useAssetClasses = (name?: string, version?: string, query?: string, searchFields?: string, operator?: string, offset?: number, limit?: number) => {
  return useQuery({
    queryKey: ['assetClasses', name, version, query, searchFields, operator, offset, limit],
    queryFn: () => getAssetClasses(name, version, query, searchFields, operator, offset, limit),
  });
};
