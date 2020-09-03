import styled from '@emotion/styled';
import React from 'react';

const LoaderContent = styled.div`
  :after {
    border-radius: 50%;
    width: 10em;
    height: 10em;
  }

  border-radius: 50%;
  width: 10em;
  height: 10em;
  font-size: 4px;
  position: relative;
  text-indent: -9999em;
  border-top: 1.1em solid rgba(13, 197, 193, 0.2);
  border-right: 1.1em solid rgba(13, 197, 193, 0.2);
  border-bottom: 1.1em solid rgba(13, 197, 193, 0.2);
  border-left: 1.1em solid #0dc5c1;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
  @-webkit-keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
`;

export const Loader: React.FC = () => (
  <LoaderWrapper>
    <LoaderContent />
  </LoaderWrapper>
);
