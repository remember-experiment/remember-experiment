import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Message from '~/component/messages/Message';
import Button from '~/component/Button';
import ErrorIcon from '~/component/icons/ErrorIcon';
import { Steps } from '~/types';

const Text = styled.p`
  font-size: 14px;
  padding-left: 20px;
`;

const MemoryFile = styled.p`
  font-family: 'Anonymous Pro', monospace;
  padding-left: 40px;
  font-size: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  color: white;
`;

const DeleteOrNot = (props) => {
  const { msg, step } = props;
  return (
    <Message
      msg={msg}
      type='error'
      title='Shocking Memories'
      icon={ <ErrorIcon color='white' size={26} strokeWidth={35} /> }
    >
      <Text>Shocking content have been found in the following memory: </Text>
      <MemoryFile>/data/memories/20161208-1732.mem</MemoryFile>
      <Text>The recomended action is to delete this memory and two related memories: </Text>
      <MemoryFile>/data/memories/20161208-1732.mem</MemoryFile>
      <MemoryFile>/data/memories/20161208-1730.mem</MemoryFile>
      { (() => {
        if (step === Steps.RecoveryDone) {
          return <Button style={{ paddingBottom: `0px` }}>Press [enter] to delete</Button>;
        }
        return null;
      })() }
      { (() => {
        if (step === Steps.RecoveryDone) {
          return <Button>Press [n] to keep</Button>;
        }
        return null;
      })() }
    </Message>
  )
};

export default DeleteOrNot;