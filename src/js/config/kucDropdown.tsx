import 'kintone-ui-component';
import { KucBase } from 'kintone-ui-component/lib/base/kuc-base';
import React, { useEffect, useRef, useState } from 'react';
import { client } from '~/src/js/utils/client';

interface KucDropdownProps extends KucBase {
  // eslint-disable-next-line no-unused-vars
  onBlur?: (event: Event) => void;
  value: string;
  requiredIcon: boolean;
  items: { value: string; label: string }[];
}
interface ChangeDetail {
  value: string;
  oldValue: string;
}

type ChangeEvent = CustomEvent<ChangeDetail>;

const KucDropdown = (props: { value: string; onBlur?: null }) => {
  const [, setVal] = useState({ value: '', oldValue: '' });
  const kucDropdownRef = useRef<KucDropdownProps | null>(null);

  useEffect(() => {
    const dropdown = kucDropdownRef.current;

    async function fetchData(dropdown: KucDropdownProps | null) {
      if (dropdown) {
        dropdown.addEventListener('change', (event: ChangeEvent) => {
          setVal({
            value: event.detail.value,
            oldValue: event.detail.oldValue,
          });
        });
        const { properties } = await client.app.getFormFields({ app: kintone.app.getId() || '', preview: true });
        const mappedFields = Object.entries(properties).map(([, value]) => ({
          value: value.code,
          label: value.label,
        }));

        dropdown.requiredIcon = true;
        dropdown.items = [{ value: '---', label: '---' }, ...mappedFields];
        dropdown.value = props.value;
      }
    }
    fetchData(dropdown);
  }, [kucDropdownRef, props.value]);

  return (
    <div style={{ display: 'inline-flex' }}>
      <kuc-dropdown-1-12-0 ref={kucDropdownRef} onBlur={props.onBlur} value={props.value}></kuc-dropdown-1-12-0>
    </div>
  );
};

export default KucDropdown;
