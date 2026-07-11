import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Shared tables (inherited from opiom_business)
export const db = {
  profiles:           () => supabase.from('profiles'),
  leads:              () => supabase.from('leads'),
  contacts:           () => supabase.from('contacts'),
  activities:         () => supabase.from('activities'),
  referralLinks:      () => supabase.from('referral_links'),
  referralClicks:     () => supabase.from('referral_clicks'),
  commissions:        () => supabase.from('commissions'),
  payouts:            () => supabase.from('payouts'),
  networkMembers:     () => supabase.from('network_members'),
  socialAccounts:     () => supabase.from('social_accounts'),
  contentPosts:       () => supabase.from('content_posts'),
  messages:           () => supabase.from('messages'),
  campaigns:          () => supabase.from('campaigns'),
  automationFlows:    () => supabase.from('automation_flows'),
  automationLogs:     () => supabase.from('automation_logs'),
  aiAgents:           () => supabase.from('ai_agents'),
  notifications:      () => supabase.from('notifications'),
  integrationConfigs: () => supabase.from('integration_configs'),
  productResources:   () => supabase.from('product_resources'),
  heatmapData:        () => supabase.from('heatmap_data'),

  // Intelligence-specific cross-door tables
  doorSessions:       () => supabase.from('door_sessions'),       // tracks which door a user is in
  globalXP:           () => supabase.from('global_xp'),           // cross-door XP aggregation
  operatorLogs:       () => supabase.from('operator_logs'),       // admin operator actions
  platformConfig:     () => supabase.from('platform_config'),     // global operator settings
};
