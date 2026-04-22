import { supabase } from './supabaseClient';

const toEmail = (username) => `${username.toLowerCase().trim()}@mnogolingo.local`;

export const authService = {
  async signup(username, password) {
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
    });
    return { data, error };
  },

  async login(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    return { data, error };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
