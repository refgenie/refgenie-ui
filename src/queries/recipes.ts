import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';

export const getRecipe = async (recipeID?: string) => {
  const url = `${API_BASE}/recipes/${recipeID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getRecipes = async (outputAssetClass?: string, name?: string, version?: string, query?: string, searchFields?: string, operator?: string, offset?: number, limit?: number) => {
  const url = `${API_BASE}/recipes`;

  const params: any = {};
  if (outputAssetClass) params.output_asset_class = outputAssetClass;
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

export const useRecipe = (recipeID?: string) => {
  return useQuery({
    queryKey: ['recipe', recipeID],
    queryFn: () => getRecipe(recipeID),
  });
};

export const useRecipes = (outputAssetClass?: string, name?: string, version?: string, query?: string, searchFields?: string, operator?: string, offset?: number, limit?: number) => {
  return useQuery({
    queryKey: ['recipes', outputAssetClass, name, version, query, searchFields, operator, offset, limit],
    queryFn: () => getRecipes(outputAssetClass, name, version, query, searchFields, operator, offset, limit),
  });
};
