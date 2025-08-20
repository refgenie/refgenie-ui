import { create } from 'zustand';

type TreeFullScreenStore = {
  isFullScreen: boolean;
  setIsFullScreen: (isFullScreen: boolean) => void;
};

export const useTreeFullScreen = create<TreeFullScreenStore>((set) => ({
  isFullScreen: false,
  setIsFullScreen: (isFullScreen: boolean) =>
    set({ isFullScreen: isFullScreen }),
}));
