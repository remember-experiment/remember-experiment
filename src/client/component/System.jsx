import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { Steps } from '~/types';
import Button from '~/component/Button';
import Message from '~/component/messages/Message';
import MessageConsole from '~/component/messages/MessageConsole';
import LoadMemories  from '~/component/messages/content/LoadMemories';
import LoadEmotions  from '~/component/messages/content/LoadEmotions';
import NeedRecovery  from '~/component/messages/content/NeedRecovery';
import FindTiles  from '~/component/messages/content/FindTiles';
import EmotionAlmostRecovered  from '~/component/messages/content/EmotionAlmostRecovered';
import LinkedMemory  from '~/component/messages/content/LinkedMemory';
import NowPlayingMemory  from '~/component/messages/content/NowPlayingMemory';
import NewMemoriesFound  from '~/component/messages/content/NewMemoriesFound';
import DeleteOrNot  from '~/component/messages/content/DeleteOrNot';
import AreYouSure  from '~/component/messages/content/AreYouSure';
import EmotionRecovered  from '~/component/messages/content/EmotionRecovered';
import AllEmotionsRecovered  from '~/component/messages/content/AllEmotionsRecovered';
import DeleteMemories  from '~/component/messages/content/DeleteMemories';
import NeedReboot  from '~/component/messages/content/NeedReboot';
import Thanks  from '~/component/messages/content/Thanks';
import { compose, ConnectReact } from '~/core';
import { inject } from 'react-tunnel';
import { displayedMessages } from '~/computed';

const MESSAGES_STACK_MAX_HEIGHT = 600;

function getMessageType(msg, step) {
  if (_.includes([
    `boot`, `boot-progress`, `boot-done`, `connect-eyes`, `connect-eyes-progress`, `connect-eyes-done`
  ], msg.key)) {
    return `console`;
  }
  return `simple`;
}

function getMessageHeight(msg, step) {
  if (msg.type === `console`) {
    return 26;
  }
  switch (msg.key) {
    case `load-memory-progress`: return 85;
    case `load-emotions-progress`: return (() => {
      var height = 85;
      if (msg.progress >= 10) { height += 50; }
      if (msg.progress >= 21) { height += 50; }
      if (msg.progress >= 37) { height += 50; }
      return height
    })();
    case `need-recovery`: return 200;
    case `find-tiles`: return 230;
    case `emotion-almost-recovered`: return 120;
    case `linked-memory`: return 190;
    case `now-playing-memory`: return ((step === Steps.Memory) ? 160 : 100);
    case `new-memories-found`: return (() => {
      if (msg.progress > 20) { return 180; }
      if (msg.progress > 10) { return 160; }
      if (msg.progress > 5) { return 140; }
      return 110;
    })();
    case `delete-or-not`: return ((step === Steps.RecoveryDone) ? 380 : 260);
    case `are-you-sure`: return ((step === Steps.ConfirmKeep) ? 220 : 130);
    case `emotion-recovered`: return 160;
    case `all-emotions-recovered`: return 100;
    case `delete-memories`: return (() => {
      if (msg.progress > 12) { return 370; }
      if (msg.progress > 9) { return 290; }
      if (msg.progress > 6) { return 260; }
      if (msg.progress > 3) { return 190; }
      if (msg.progress > 0) { return 180; }
      return 90;
    })();
    case `need-reboot`: return 160;
    case `thanks`: return 150;
  }
  return 60;
}

const Container = styled.div`
  position: absolute;
  height: 500px;
  width: 500px;
  bottom: 40px;
  right: 50px;
  padding: 0;
  color: white;
  text-align: left;
  line-height: 1.5;
  z-index: 500;
`;

const System = compose(
  ConnectReact(
    {
      messages: `system.messages`,
      step: `app.step`
    }
  )
)((props) => {
  var distFromBottom = 0;
  var numberOfMessages = 8;
  if (
    props.step === Steps.ConfirmKeep ||
    props.step === Steps.Keep ||
    props.step === Steps.Delete
  ) {
    numberOfMessages = 2;
  }
  if (props.step === Steps.Thanks) {
    numberOfMessages = 3;
  }
  const messages = props.messages.slice(-numberOfMessages).map(msg => Object.assign({}, msg));
  _.forEachRight(messages, (msg) => {
    msg.type = getMessageType(msg, props.step);
    msg.height = getMessageHeight(msg, props.step);
    msg.distFromBottom = distFromBottom;
    distFromBottom += msg.height;
    msg.ignored = distFromBottom > MESSAGES_STACK_MAX_HEIGHT;
  });
  const notIgnoredMessages = messages.filter((msg) => !msg.ignored);

  return (
    <Container>
      {
        notIgnoredMessages.map(msg => {
          if (msg.type === `console`) {
            return <MessageConsole msg={msg} key={msg.key} />;
          }
          switch (msg.key) {
            case `load-memory-progress`: return <LoadMemories msg={msg} key={msg.key} />;
            case `load-emotions-progress`: return <LoadEmotions msg={msg} key={msg.key} />;
            case `need-recovery`: return <NeedRecovery msg={msg} key={msg.key} />;
            case `find-tiles`: return <FindTiles msg={msg} key={msg.key} />;
            case `emotion-almost-recovered`: return <EmotionAlmostRecovered msg={msg} key={msg.key} />;
            case `linked-memory`: return <LinkedMemory msg={msg} key={msg.key} />;
            case `now-playing-memory`: return <NowPlayingMemory msg={msg} step={props.step} key={msg.key} />;
            case `new-memories-found`: return <NewMemoriesFound msg={msg} key={msg.key} />;
            case `delete-or-not`: return <DeleteOrNot msg={msg} step={props.step} key={msg.key} />;
            case `are-you-sure`: return <AreYouSure msg={msg} step={props.step} key={msg.key} />;
            case `emotion-recovered`: return <EmotionRecovered msg={msg} key={msg.key} />;
            case `all-emotions-recovered`: return <AllEmotionsRecovered msg={msg} key={msg.key} />;
            case `delete-memories`: return <DeleteMemories msg={msg} key={msg.key} />;
            case `need-reboot`: return <NeedReboot msg={msg} key={msg.key} />;
            case `thanks`: return <Thanks msg={msg} key={msg.key} />;
          }
          return (
            <Message msg={ msg } type='error'>
              TODO : { msg.key }
            </Message>
          );
        })
      }
    </Container>
  );
});

export default System;
