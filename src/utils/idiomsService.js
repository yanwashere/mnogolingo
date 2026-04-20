import { supabase } from './supabaseClient';

export const idiomsService = {
  async getIdioms(userId) {
    const { data, error } = await supabase
      .from('idioms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addIdiom(userId, chineseText, pinyin, translation, example) {
    const { data, error } = await supabase
      .from('idioms')
      .insert([
        {
          user_id: userId,
          chinese_text: chineseText,
          pinyin,
          translation,
          example,
        },
      ])
      .select();
    return { data, error };
  },

  async deleteIdiom(idId) {
    const { error } = await supabase
      .from('idioms')
      .delete()
      .eq('id', idId);
    return { error };
  },

  async updateProgress(userId, idiomId, isLearned) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          idiom_id: idiomId,
          is_learned: isLearned,
          updated_at: new Date(),
        },
        { onConflict: 'user_id,idiom_id' }
      )
      .select();
    return { data, error };
  },

  async getProgress(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },
};
