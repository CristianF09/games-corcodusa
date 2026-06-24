import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level safety net. Without this, any uncaught render error (a bad API
 * response, a null where an array was expected, etc.) unmounts the entire
 * React tree and the user sees a blank page with no way to recover except a
 * full reload. With it, only the broken section/page shows a friendly
 * message and a way back, while the rest of the app stays usable.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error caught by ErrorBoundary:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="text-5xl">😅</div>
          <h1 className="font-display text-2xl font-bold">A apărut o problemă</h1>
          <p className="max-w-md text-muted-foreground">
            Ceva nu a funcționat cum trebuie pe această pagină. Încearcă să reîncarci.
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.href = "/";
            }}
            className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-md transition-transform hover:-translate-y-0.5"
          >
            Înapoi la pagina principală
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
