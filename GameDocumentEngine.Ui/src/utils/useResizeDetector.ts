import { useEffect, useRef, useMemo } from 'react';
import { PrimitiveAtom, useSetAtom, atom } from 'jotai';

export interface ElementDimensions {
	left?: number;
	top?: number;
	height?: number;
	width?: number;
}

export interface useResizeDetectorProps {
	/**
	 * These options will be used as a second parameter of `resizeObserver.observe` method
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe
	 * Default: undefined
	 */
	observerOptions?: ResizeObserverOptions;
	/**
	 * The value to write the dimensions
	 */
	atom?: PrimitiveAtom<ElementDimensions>;
}

type UpdateObserverParams<T extends HTMLElement | SVGElement = HTMLElement> = [
	T | null,
	ResizeObserverOptions | undefined,
	ResizeObserver | null,
];

function updateObserver<T extends HTMLElement | SVGElement = HTMLElement>(
	setDimensions: (rect: DOMRect) => void,
	...[target, options, previousObserver]: UpdateObserverParams<T>
): UpdateObserverParams<T> {
	const resizeCallback = () => {
		const rect = target?.getBoundingClientRect();
		if (!rect) return;
		setDimensions(rect);
	};

	previousObserver?.disconnect();
	if (target === null) {
		return [null, options, null];
	}
	const resizeObserver = new window.ResizeObserver(resizeCallback);

	if (target) {
		resizeObserver.observe(target, options);
	}
	resizeCallback();
	return [target, options, resizeObserver];
}

function cancelObserver<T extends HTMLElement | SVGElement = HTMLElement>(
	...[target, options, previousObserver]: UpdateObserverParams<T>
): UpdateObserverParams<T> {
	previousObserver?.disconnect();
	return [target, options, null];
}

function useResizeDetector<T extends HTMLElement | SVGElement = HTMLElement>({
	observerOptions,
	atom: targetAtom,
}: useResizeDetectorProps = {}): [
	React.Ref<T>,
	PrimitiveAtom<ElementDimensions>,
] {
	const localAtom = useMemo(() => atom<ElementDimensions>({}), []);
	const resultAtom = targetAtom ?? localAtom;
	const setDimensions = useSetAtom(resultAtom);

	const localRef = useRef<
		[T | null, ResizeObserverOptions | undefined, ResizeObserver | null]
	>([null, observerOptions, null]);
	const ref = (target: T | null) => {
		if (localRef.current[0] !== target) {
			localRef.current = updateObserver(
				setDimensions,
				target,
				localRef.current[1],
				localRef.current[2],
			);
		}
	};

	useEffect(() => {
		localRef.current = updateObserver(
			setDimensions,
			localRef.current[0],
			observerOptions,
			localRef.current[2],
		);

		return () => {
			localRef.current = cancelObserver(...localRef.current);
		};
	}, [observerOptions, setDimensions]);

	return [ref as React.Ref<T>, resultAtom];
}

export default useResizeDetector;
