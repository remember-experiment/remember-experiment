import { state, set, wait, debounce, when, merge, input } from 'cerebral/operators';
import { Worlds } from '~/types';
import { getDuration } from './actions';

export default {
  state: {
    size: {
      width: 600,
      height: 600
    },
    world: Worlds.Black,
    nextWorld: null,
    webglReady: false
  },
  signals: {
    setSize: [
      merge(state`app.size`, { width: input`width`, height: input`height` })
    ],
    webglReady: [
      set(state`app.webglReady`, true)
    ],
    setCurrentWorld: [
      set(state`app.world`, input`world`)
    ],
    transitionToWorld: [
      set(state`app.nextWorld`, input`world`),
      ...debounce(1000, [
        set(state`app.world`, input`world`),
        set(state`app.nextWorld`, null)
      ])
    ]
  }
};
