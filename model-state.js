/* Discrete teaching states, not a time/thermal/electromagnetic simulation. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UkiwaModelState = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function initial(kind) {
    return {kind, step:0, running:false, closed:true, power:true, relay:false,
      released:false, auxClosed:true, fault:false, mode:'normal', fused:false};
  }
  function next(s, action) {
    s = {...s};
    if (action === 'reset') return initial(s.kind);
    if (action === 'fault') return {...initial(s.kind), fault:!s.fault};
    if (action === 'power') {
      s.power = !s.power;
      if (!s.power && !s.released) {s.running=false; s.relay=false; s.step=0;}
      return s;
    }
    if (action === 'relay-off') {
      s.relay=false;
      if (!s.released) {s.running=false; s.step=0;}
      return s;
    }
    if (action.startsWith('mode:')) return {...s, mode:action.slice(5), running:false, step:0};
    if (action === 'open' || action === 'close') {
      if (action === 'close' && s.fused) return s;
      return {...s, closed:action === 'close', auxClosed:action === 'close', running:false};
    }
    if (s.kind === 'vcb') {
      if (action === 'play') {
        if (!s.power || !s.closed || s.running || s.released) return s;
        return {...s, running:true, relay:true, step:1, released:false};
      }
      if (action === 'tick' && s.running) {
        if (s.step === 1) {
          if (!s.power || !s.relay) return {...s, running:false, step:0};
          s.released=true; s.step=2;
        } else if (s.step === 2) {s.closed=false; s.step=3;}
        else if (s.step === 3) {
          if (!s.fault) s.auxClosed=false;
          s.step=4;
          if (s.fault) s.running=false;
        } else {s.relay=false; s.running=false; s.step=5;}
      }
    } else if (s.kind === 'lbs') {
      if (action === 'play' && !s.fused && s.closed && !s.running) return {...s, running:true, closed:true, step:1};
      if (action === 'tick' && s.running) {
        s.step++;
        if (s.step === 2) s.fused=true;
        if (s.step >= 3) {s.closed=false; s.running=false;}
      }
    }
    return s;
  }
  function electrical(s) {
    return {tc:s.kind==='vcb' && s.power && s.relay && s.auxClosed,
      a:s.auxClosed, b:!s.auxClosed, main:s.closed, fuse:!s.fused};
  }
  return {initial, next, electrical};
});
