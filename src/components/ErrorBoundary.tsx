import React from "react";
import { toast } from "sonner";

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // Log and show a user-friendly toast
    // eslint-disable-next-line no-console
    console.error("Uncaught error in component:", error, info);
    try {
      toast.error("Ocurrió un error al renderizar la vista");
    } catch (_e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500 font-semibold">Ocurrió un error</p>
          <p className="text-sm text-gray-500">
            Revisa la consola para más detalles.
          </p>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
