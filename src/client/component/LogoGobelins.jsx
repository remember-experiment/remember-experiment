import React from 'react';
import styled, { css } from 'styled-components';
import _ from 'lodash';

const Container = styled.div`
  position: absolute;
  bottom: 3%;
  left: 3%;

  svg{
    width: 10%;
  }
`;

const LogoGobelins = (props) => {
  const color = props.color || `#FFFFFF`;
  return (
    <Container {...props} dangerouslySetInnerHTML={{__html: `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 348 612"><title>Fichier 1</title><g id="Calque_2" data-name="Calque 2"><g id="Calque_1-2" data-name="Calque 1"><image width="348" height="612" xlink:href="data:image/png;base64,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"/></g></g></svg>
    `}}>
    </Container>
  );
};

export default LogoGobelins;
