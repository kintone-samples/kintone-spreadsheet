import { version } from 'kintone-ui-component';
import { KucBase } from 'kintone-ui-component/lib/base/kuc-base';
import React, { useEffect, useRef } from 'react';

interface KucButtonProps extends KucBase {
  // eslint-disable-next-line no-unused-vars
  onClick: (event: Event) => void;
  text?: string;
  type?: string;
  content?: string;
  disabled?: boolean;
  visible?: boolean;
  className: string;
  id: string;
}

const KucButton = (props: {
  id: string;
  type: string;
  // eslint-disable-next-line no-unused-vars
  onClick: (event: Event) => void;
  text: string;
}) => {
  const kucButtonRef = useRef<KucButtonProps | null>(null);

  useEffect(() => {
    const button = kucButtonRef.current;
    if (button) {
      button.addEventListener('click', props.onClick);
    }
  }, [kucButtonRef, props.onClick]);

  const KUCButton = `kuc-button-${version.replace(/\./g, '-')}`;

  return (
    <>
      <KUCButton ref={kucButtonRef} id={props.id} text={props.text} type={props.type}></KUCButton>
    </>
  );
};

export default KucButton;
