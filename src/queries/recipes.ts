import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE || '';


export const getRecipe = async (recipeID?: string) => {
  const url = `${API_BASE}/recipes/${recipeID}`;

  const { data } = await axios.get<any>(url);
  return data;
};

export const getRecipes = async () => {
  const url = `${API_BASE}/recipes`;
  const { data } = await axios.get<any>(url);
  return data;
};

export const useRecipe = (recipeID?: string) => {
  return useQuery({
    queryKey: ['recipes', recipeID],
    queryFn: () => getRecipe(recipeID),
  });
};

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => getRecipes(),
  });
};
