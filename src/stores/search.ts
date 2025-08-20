import { create } from 'zustand';

type AboutSearchStore = {
  searchTerm: string;
  setSearchTerm: (searchText: string) => void;
};

type SelectedSpeciesStore = {
  selectedSpecies: string;
  setSelectedSpecies: (searchText: string) => void;
};

export const useAboutSearch = create<AboutSearchStore>((set) => ({
  searchTerm: '',
  setSearchTerm: (searchText: string) => set({ searchTerm: searchText }),
}));

export const useSelectedSpecies = create<SelectedSpeciesStore>((set) => ({
  selectedSpecies: '',
  setSelectedSpecies: (speciesName: string) =>
    set({ selectedSpecies: speciesName }),
}));
