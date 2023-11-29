import { Component } from 'react';

type ErrorBoundaryProps = {
	fallback: React.ReactNode;
	children?: React.ReactNode;
};

type ErrorBoundaryState = {
	hasError: false;
};

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error: unknown, info: React.ErrorInfo) {
		// TODO: send error to service
		console.error({ error, info });
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return this.props.fallback;
		}

		return this.props.children;
	}
}
