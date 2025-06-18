import axios from 'axios';
import { useQuery } from '@tanstack/react-query';


const API_BASE = 'https://api.refgenie.org/v4';

export const getRecipes = async () => {
  const url = `${API_BASE}/recipes`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => getRecipes(),
  });
};


