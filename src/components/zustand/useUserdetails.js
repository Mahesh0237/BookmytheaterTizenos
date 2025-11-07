import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserdetails = create(
  persist(
    (set) => ({
      userInfo: null,
      isLogged: false,
      access_token: null,

      updateAuthDetails: (data, token) => {
        set({
          userInfo: data,
          isLogged: true,
          access_token: token,
        });
      },

      resetAuthdetails: () => {
        set({
          userInfo: null,
          isLogged: false,
          access_token: null,
        });
      },
    }), { name: 'userAuthdetails', }
  )
);