import { useEffect, useRef } from 'react';
import { Config } from '~/src/js/config';

export const fetchConfig = async (PLUGIN_ID: string): Promise<Config | null> => {
  // Get saved config
  const rawConfig = kintone.plugin.app.getConfig(PLUGIN_ID)?.config;
  if (!rawConfig) return null;
  const config = JSON.parse(rawConfig);
  return config;
};

export const useRecursiveTimeout = <T extends unknown>(
  callback: () => Promise<T> | (() => void),
  delay: number | null,
): void => {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout loop.
  useEffect(() => {
    let id: NodeJS.Timeout;
    function tick() {
      const ret = savedCallback.current();

      if (ret instanceof Promise) {
        ret.then(() => {
          if (delay !== null) {
            id = setTimeout(tick, delay);
          }
        });
      } else {
        if (delay !== null) {
          id = setTimeout(tick, delay);
        }
      }
    }
    if (delay !== null) {
      id = setTimeout(tick, delay);
      return () => id && clearTimeout(id);
    }
  }, [delay]);
};
