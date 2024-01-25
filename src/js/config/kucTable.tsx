import { version } from 'kintone-ui-component';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { KucBase } from 'kintone-ui-component/lib/base/kuc-base';
import KucDropdown from './kucDropdown';

interface KucTableProps extends KucBase {
  // eslint-disable-next-line no-unused-vars
  onChange: (event: Event) => void;
  columns: {
    title: string;
    field: string;
    // eslint-disable-next-line no-unused-vars
    render: (cellData: string) => HTMLElement;
  }[];
  data: string[];
}

const KucTable = (props) => {
  const kucTableRef = useRef<KucTableProps | null>(null);
  useEffect(() => {
    const table = kucTableRef.current;
    if (table) {
      table.addEventListener('change', props.onChange);
    }

    const renderName = (cellData: string) => {
      const setValue = !cellData ? '---' : cellData;
      const spanElement = document.createElement('span');
      const dropdown = <KucDropdown value={setValue}></KucDropdown>;
      ReactDOM.render(dropdown, spanElement);
      return spanElement;
    };

    if (table) {
      table.data = props.config.columns.map((column: { code: string }) => {
        return {
          field: column.code,
        };
      });

      table.columns = [
        {
          title: 'フィールド',
          field: 'field',
          render: renderName,
        },
      ];
    }
  }, [kucTableRef, props.config.columns, props.onChange]);

  const KUCTable = `kuc-table-${version.replace(/\./g, '-')}`;

  return (
    <div>
      <KUCTable
        ref={kucTableRef}
        className={props.className}
        id={props.id}
        label={props.label}
        actionButton={props.actionButton}
        visible={props.visible}
      ></KUCTable>
    </div>
  );
};

export default KucTable;
