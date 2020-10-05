import { useEffect, useRef } from 'react';
import Handsontable from 'handsontable';
import { useAsync, useAsyncFn } from 'react-use';
import { HotTable } from '@handsontable/react';
import { Record } from '@kintone/rest-api-client/lib/client/types';
import { client } from '~/src/js/utils/client';

const NOT_ALLOWED_EDIT_FIELDS = [
  'RECORD_NUMBER',
  'CREATED_TIME',
  'UPDATED_TIME',
  'CREATOR',
  'MODIFIER',
  'STATUS',
  'STATUS_ASSIGNEE',
  'CALC',
  'CHECK_BOX',
  'MULTI_SELECT',
  'FILE',
  'CATEGORY',
  'SUBTABLE',
  'ORGANIZATION_SELECT',
  'GROUP_SELECT',
];

const shapingRecord = (record: Record) =>
  Object.fromEntries(
    Object.entries(record).map(([k, v]) => [
      k,
      { ...v, value: v.type === 'NUMBER' ? v.value.replace(/[^0-9]/g, '') : v.value },
    ]),
  );

const excludeNonEditableFields = (record: Record) =>
  Object.fromEntries(Object.entries(record).filter(([, v]) => NOT_ALLOWED_EDIT_FIELDS.indexOf(v.type) === -1));

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

export const useOnChangeCheckbox = ({
  hotRef,
  appId,
}: {
  hotRef: React.RefObject<HotTable>;
  appId: number;
}): ReturnType<typeof useAsyncFn> => {
  return useAsyncFn(
    async (event: React.ChangeEvent<HTMLInputElement>, row: number) => {
      const hot = hotRef.current?.hotInstance ?? undefined;
      if (!hot) return;
      const sourceData = hot.getSourceData();
      const code = event.target.getAttribute('data-code') || '';
      const value = event.target.getAttribute('data-name') || '';
      const beforeValues = sourceData[row]?.[code]?.value as string[];
      const nextValues = (() => {
        // すでに値をもっているか
        const exsitedValueIndex = beforeValues.findIndex((v) => v === value);
        if (exsitedValueIndex < 0) {
          if (event.target.checked) {
            return [...beforeValues, value];
          } else {
            return [...beforeValues];
          }
        } else {
          if (event.target.checked) {
            return [...beforeValues];
          } else {
            return [...beforeValues.slice(0, exsitedValueIndex), ...beforeValues.slice(exsitedValueIndex + 1)];
          }
        }
      })();

      // TODO: 本体側と共通化
      await client.bulkRequest({
        requests: [
          {
            method: 'PUT',
            api: '/k/v1/records.json',
            payload: {
              app: appId,
              records:
                sourceData[row]?.$id?.value != null
                  ? [
                      {
                        id: sourceData[row].$id.value,
                        record: {
                          ...shapingRecord(excludeNonEditableFields(sourceData[row])),
                          [code]: { value: nextValues },
                        },
                      },
                    ]
                  : [],
            },
          },
          {
            method: 'POST',
            api: '/k/v1/records.json',
            payload: {
              app: appId,
              records:
                sourceData[row]?.$id?.value == null
                  ? [{ ...shapingRecord(excludeNonEditableFields(sourceData[row])), [code]: { value: nextValues } }]
                  : [],
            },
          },
        ],
      });
    },
    [appId, hotRef],
  );
};

export const useAfterChange = ({
  hotRef,
  appId,
}: {
  hotRef: React.RefObject<HotTable>;
  appId: number;
}): ReturnType<typeof useAsyncFn> => {
  return useAsyncFn(
    async (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      const hot = hotRef.current?.hotInstance ?? undefined;
      if (!hot) return;

      const sourceData = hot.getSourceData();

      // データ読み込み時はイベントを終了
      if (source === 'loadData' || !changes) return;

      const changedRows = changes.map((row) => row[0]).filter((x, i, arr) => arr.indexOf(x) === i);

      // FIXME: ここらへんはSourceData起点がいいかもしれない
      const insertRecords = changedRows
        .filter((row) => !sourceData[row]?.$id?.value)
        .map((row) => shapingRecord(excludeNonEditableFields(sourceData[row])));

      const updateRecords = changedRows
        .filter((row) => sourceData[row]?.$id?.value)
        .map((row) => ({
          id: sourceData[row].$id.value,
          record: shapingRecord(excludeNonEditableFields(sourceData[row])),
        }));

      return client.bulkRequest({
        requests: [
          {
            method: 'PUT',
            api: '/k/v1/records.json',
            payload: {
              app: appId,
              records: updateRecords,
            },
          },
          {
            method: 'POST',
            api: '/k/v1/records.json',
            payload: {
              app: appId,
              records: insertRecords,
            },
          },
        ],
      });
    },
    [appId, hotRef],
  );
};
