import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = 'https://api.refgenie.org/v4';


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


