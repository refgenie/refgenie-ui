import { create } from 'zustand';

type AboutSearchStore = {
  searchTerm: string;
  setSearchTerm: (searchText: string) => void;
};

export const useAboutSearch = create<AboutSearchStore>((set) => ({
  searchTerm: '',
  setSearchTerm: (searchText: string) => set({ searchTerm: searchText }),
}));
