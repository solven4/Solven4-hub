import { create } from 'zustand';
import { supabase, db } from '@/lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId) => {
    const { data } = await db.profiles().select('*').eq('id', userId).single();
    if (data) set({ profile: data });
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const { data } = await db.profiles().update(updates).eq('id', user.id).select().single();
    if (data) set({ profile: data });
    return data;
  },
}));
