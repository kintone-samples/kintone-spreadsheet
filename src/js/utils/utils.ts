import { Config } from '~/src/js/config';

export const fetchConfig = async (PLUGIN_ID: string): Promise<Config | null> => {
  // Get saved config
  const rawConfig = kintone.plugin.app.getConfig(PLUGIN_ID)?.config;
  if (!rawConfig) return null;
  const config = JSON.parse(rawConfig);
  return config;
};
