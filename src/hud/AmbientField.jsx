import { Suspense, lazy, Component } from 'react';

/* Persistent holographic environment that lives in the app shell and renders
   behind every page — the "Jarvis room" the whole HUB floats inside.
   Lazy + error-boundaried so a WebGL-incapable device simply shows nothing
   extra (the CSS ambient glows still render underneath). */

const AmbientScene = lazy(() => import('./AmbientScene.jsx'));

class GLBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? null : this.props.children; }
}

export default function AmbientField({ accent = '#6366f1' }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.9 }}
    >
      <GLBoundary>
        <Suspense fallback={null}>
          <AmbientScene accent={accent} />
        </Suspense>
      </GLBoundary>
    </div>
  );
}
