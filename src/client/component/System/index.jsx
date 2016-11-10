import React from 'react';
import { BindCSS, Connect } from '~/core';
import styles from './System';
import { actions, Steps } from '~/store';
import _ from 'lodash';

@Connect(
  (store, props) => ({
    step: store.get(`step`),
    messages: store.getComputed(`messages`).toJS(),
    full: store.getComputed(`systemFull`)
  }),
  {
    setStep: actions.step.setCurrent
  }
)
@BindCSS(styles)
class System extends React.Component {
  render() {
    const classes = [`system`];
    if (this.props.full) {
      classes.push(`full`);
    }
    return (
      <div styleName={classes.join(` `)}>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    switch (this.props.step) {
      case Steps.Boot:
        return this.renderBoot();
      case Steps.MissingFiles:
        return this.renderMissingFiles();
      case Steps.RecoveryWillStart:
        return this.renderRecoveryWillStart();
      case Steps.RecoveryLvl1Done:
        return this.renderRecoveryLvl1Done();
      default:
        return null;
    }
  }

  renderBoot() {
    return (
      <div>
        { this.props.messages.map(msg => (
          <p key={ msg.id }>{ msg.value }</p>
        )) }
      </div>
    );
  }

  renderMissingFiles() {
    return (
      <button onClick={() => this.props.setStep(Steps.RecoveryWillStart) }>
        Start Recovery
      </button>
    );
  }

  renderRecoveryWillStart() {
    return (
      <div>
        <p>
          Are you ready ?
        </p>
        <button onClick={() => this.props.setStep(Steps.RecoveryLvl1) }>
          Go !
        </button>
      </div>
    );
  }

  renderRecoveryLvl1Done() {
    return (
      <div>
        Souvenir retrouvé !
      </div>
    );
  }

}

export default System;
