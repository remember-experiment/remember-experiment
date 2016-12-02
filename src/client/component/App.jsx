import React from 'react';
import styled, { injectGlobal } from 'styled-components';
import { compose, ConnectReact } from '~/core';
import System from '~/component/System';
import Credits from '~/component/Credits';

require('normalize.css/normalize.css');

injectGlobal`
  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`;

const AppContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

    &:after{
      background: url( 'http://s.cdpn.io/1715/noise-1.png' )
      position: absolute
      content: ''
      z-index: 1
      opacity: 0.8
      height: 100%
      width: 100%
      left: 0
      top: 0
  }
`;

const App = compose(
  // ConnectReact(
  //   {}
  // )
)((props) => {
  return (
    <AppContainer>
      <System />
    </AppContainer>
  );
});

export default App;
