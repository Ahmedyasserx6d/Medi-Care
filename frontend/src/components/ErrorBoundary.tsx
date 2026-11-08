import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 m-10 bg-red-50 border border-red-200 rounded-2xl">
          <h1 className="text-2xl font-black text-red-600 mb-4">React UI Crashed</h1>
          <p className="font-bold text-gray-700 mb-2">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-[10px] text-gray-500 bg-white p-4 rounded-xl overflow-auto h-64">
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
