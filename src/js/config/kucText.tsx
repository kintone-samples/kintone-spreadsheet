import exp from 'constants';
import 'kintone-ui-component';
import { KucBase } from 'kintone-ui-component/lib/base/kuc-base';
import React, { useEffect, useRef } from 'react';

interface KucTextProps extends KucBase {
  // eslint-disable-next-line no-unused-vars
  onChange: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  onFocus: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  onInput: (event: Event) => void;
  className: string;
  error: string;
  id: string;
  label: string;
  placeholder: string;
  prefix: string;
  suffix: string;
  textAlign: string;
  value: string;
  disabled: boolean;
  requiredIcon: boolean;
  visible: boolean;
}

const KucText = (props) => {
  const kucTextRef = useRef<KucTextProps | null>(null);

  useEffect(() => {
    const text = kucTextRef.current;
    if (text) {
      text.addEventListener('change', props.onChange);
      text.addEventListener('focus', props.onFocus);
      text.addEventListener('input', props.onInput);
    }
  }, [kucTextRef, props.onChange, props.onFocus, props.onInput]);

  return (
    <div>
      <kuc-text-1-12-0
        ref={kucTextRef}
        className={props.className}
        error={props.error}
        id={props.id}
        label={props.label}
        placeholder={props.placeholder}
        prefix={props.prefix}
        suffix={props.suffix}
        textAlign={props.textAlign}
        value={props.value}
        disabled={props.disabled}
        requiredIcon={props.requiredIcon}
        visible={props.visible}
      ></kuc-text-1-12-0>
    </div>
  );
};

export default KucText;
