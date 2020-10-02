import { useEffect, useRef } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import { HotTable } from '@handsontable/react';
import { client } from '~/src/js/utils/client';

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

export const useFetchRecords = ({
  hotRef,
  isPageVisible,
  appId,
  query,
}: {
  hotRef: React.RefObject<HotTable>;
  isPageVisible: boolean;
  appId: number;
  query: string;
}): ReturnType<typeof useAsyncFn> => {
  return useAsyncFn(async (): Promise<void> => {
    const hot = hotRef.current?.hotInstance ?? undefined;
    if (!hot || !isPageVisible) return;
    const { records } = await client.record.getRecords({ app: appId, query });
    hot.loadData(records);
  }, [hotRef, appId, query, isPageVisible]);
};
