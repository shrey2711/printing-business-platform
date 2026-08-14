import { Component } from 'react';

// After a deploy, an already-open tab may try to lazy-import a code-split chunk
// whose hashed filename no longer exists (the new build replaced it). That
// rejects with a "failed to fetch dynamically imported module" error and, with
// no boundary, blanks the whole app. This boundary catches that specific case
// and reloads once (guarded against loops) so the tab picks up the fresh build.
const isChunkLoadError = (error) => {
  const msg = `${error?.message || ''} ${error?.name || ''}`.toLowerCase();
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('failed to fetch') ||
    msg.includes('importing a module script failed')
  );
};

export default class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(error) {
    if (isChunkLoadError(error)) {
      // Reload once to fetch the current index + chunks. sessionStorage guards
      // against a reload loop if the failure is not actually stale-chunk related.
      const KEY = 'chunk-reload-attempt';
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, '1');
        window.location.reload();
        return { failed: false };
      }
      return { failed: true };
    }
    return { failed: true };
  }

  componentDidMount() {
    // Clear the guard on a clean mount so a later, genuine stale chunk can reload.
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('chunk-reload-attempt');
  }

  componentDidUpdate(prevProps) {
    // Error boundaries do NOT reset on their own. Without this, a single caught
    // error would keep showing the fallback on every later navigation (incl.
    // back/forward), leaving the app "stuck". Clear the failed state whenever the
    // route changes so navigating away recovers.
    if (this.state.failed && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="page">
          <p className="muted">Something went wrong loading this page.</p>
          <button className="btn btn-blue" onClick={() => window.location.reload()}>Reload</button>
        </main>
      );
    }
    return this.props.children;
  }
}
