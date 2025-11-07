import { create } from 'zustand';

export const useLocationStore = create((set) => ({
  location: null,
  permissionStatus: "prompt",

  updateLocationDetails: (locationData, permissionsts) => {
    set({
      location: locationData,
      permissionStatus: permissionsts
    })
  },

  resetLocation: () => {
    set({ location: null, permissionStatus: "prompt" });
  },
}));
