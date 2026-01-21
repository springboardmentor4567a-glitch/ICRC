import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: "#ffe9e9", color: "#a70000", borderRadius: 8 }}>
          <h2>Oops! Something went wrong.</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
