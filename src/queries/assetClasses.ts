import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || '';


export const getAssetClasses = async () => {
  const url = `${API_BASE}/asset_classes`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useAssetClasses = () => {
  return useQuery({
    queryKey: ['assetClasses'],
    queryFn: () => getAssetClasses(),
  });
};


