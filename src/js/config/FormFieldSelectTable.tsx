import { useAsync } from 'react-use';
import React, { useState, useCallback, useEffect, SyntheticEvent } from 'react';
import { client } from '~/src/js/utils/client';

export interface FormField {
  code: string;
}

interface FormApiResponse {
  properties: FormField[];
}

export interface OnChange {
  (selectedFields: FormField[]): void;
}

export interface Props {
  onChange: OnChange;
  defaultSelectedFields: FormField[];
}

interface SelectProps {
  appFields: FormField[];
  index: number;
  defaultCode: string;
  onChange: (event: SyntheticEvent<HTMLSelectElement>, index: number) => void;
}

const Select: React.FC<SelectProps> = ({ appFields, onChange, index, defaultCode }) => {
  // Give index number
  const onChangeHandler = useCallback(
    (event) => {
      onChange(event, index);
    },
    [index, onChange],
  );

  return (
    <div className="kintoneplugin-input-outer">
      <div className="kintoneplugin-select">
        <select onChange={onChangeHandler} value={defaultCode}>
          {appFields.map(({ code }) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const useFormFieldSelectTable = (
  onChange: (selectedFields: FormField[]) => void,
  defaultSelectedFields: FormField[],
) => {
  const [appFields, setAppfields] = useState<FormField[]>([]);
  const [selectedFields, setSelectedFields] = useState<FormField[]>(defaultSelectedFields);
  const onChangeSelect = useCallback(
    (event: SyntheticEvent<HTMLSelectElement>, index: number) => {
      const value = event.currentTarget.value;
      setSelectedFields((selectedFields) => {
        if (selectedFields.length <= index) {
          return [...selectedFields, { code: value }];
        }
        return [...selectedFields.slice(0, index), { code: value }, ...selectedFields.slice(index + 1)];
      });
    },
    [setSelectedFields],
  );

  useEffect(() => {
    onChange(selectedFields);
  }, [onChange, selectedFields]);

  // TODO: loading
  const fetchFieldsState = useAsync(async () => {
    const { properties } = await client.app.getFormFields({ app: kintone.app.getId() || '', preview: true });
    const mappedFields = Object.entries(properties).map(([, v]) => v);
    setAppfields(mappedFields);
  }, []);

  const onClickAddColumn = useCallback(
    (index: number) => () =>
      setSelectedFields((selectedFields) => [
        ...selectedFields.slice(0, index + 1),
        { code: appFields[0]?.code || '' },
        ...selectedFields.slice(index + 1),
      ]),
    [appFields, setSelectedFields],
  );
  const onClickRemoveColumn = useCallback(
    (index: number) => () =>
      setSelectedFields((selectedFields) => [...selectedFields.slice(0, index), ...selectedFields.slice(index + 1)]),
    [setSelectedFields],
  );

  return { appFields, selectedFields, onChangeSelect, onClickAddColumn, onClickRemoveColumn };
};

const FormFieldSelectTable: React.FC<Props> = ({ onChange, defaultSelectedFields }) => {
  const { appFields, selectedFields, onChangeSelect, onClickAddColumn, onClickRemoveColumn } = useFormFieldSelectTable(
    onChange,
    defaultSelectedFields,
  );
  return (
    <table>
      <thead>
        <tr>
          {selectedFields.map((v, i) => (
            <th key={i}>
              {i + 1} 列目
              <div className="control">
                <button onClick={onClickAddColumn(i)}>+</button>
                {selectedFields.length > 1 && <button onClick={onClickRemoveColumn(i)}>-</button>}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {selectedFields.map((v, i) => (
            <td key={i}>
              <Select appFields={appFields} onChange={onChangeSelect} index={i} defaultCode={v.code} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default FormFieldSelectTable;
