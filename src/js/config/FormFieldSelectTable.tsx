import React, { useState, useCallback, ChangeEvent, useEffect, SyntheticEvent } from 'react';

interface FormField {
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
}

export interface SelectProps {
  appFields: FormField[];
  index: number;
  onChange: (event: SyntheticEvent<HTMLSelectElement>, index: number) => void;
}

const Select: React.FC<SelectProps> = ({ appFields, onChange, index }) => {
  // Give index number
  const onChangeHandler = useCallback((event) => {
    onChange(event, index);
  }, []);

  return (
    <div className="kintoneplugin-input-outer">
      <div className="kintoneplugin-select">
        <select onChange={onChangeHandler}>
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

const useFormFieldSelectTable = (onChange: (selectedFields: FormField[]) => void) => {
  const [appFields, setAppfields] = useState<FormField[]>([]);
  const [selectedFields, setSelectedFields] = useState<FormField[]>([]);
  const onChangeSelect = useCallback(
    (event: SyntheticEvent<HTMLSelectElement>, index: number) => {
      const value = event.currentTarget.value;
      setSelectedFields((selectedFields) => {
        if (selectedFields.length <= index) {
          return [...selectedFields, { code: value }];
        }
        selectedFields[index] = { code: value };
        return [...selectedFields];
      });
    },
    [setSelectedFields],
  );

  useEffect(() => {
    onChange(selectedFields);
  }, [selectedFields]);

  useEffect(() => {
    (async () => {
      const { properties } = (await kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {
        app: kintone.app.getId(),
      })) as FormApiResponse;
      setAppfields(properties);
      setSelectedFields([{ code: properties[0]?.code || '' }]);
    })();
  }, []);

  return { appFields, selectedFields, onChangeSelect };
};

const FormFieldSelectTable: React.FC<Props> = ({ onChange }) => {
  const { appFields, selectedFields, onChangeSelect } = useFormFieldSelectTable(onChange);
  return (
    <table>
      <thead>
        {selectedFields.map((v, i) => (
          <tr key={i}>
            <th>{i + 1} 列目</th>
          </tr>
        ))}
      </thead>
      <tbody>
        <tr>
          {selectedFields.map((v, i) => (
            <td key={i}>
              <Select appFields={appFields} onChange={onChangeSelect} index={i} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default FormFieldSelectTable;
