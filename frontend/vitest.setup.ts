import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

// jsdom implements none of these; Base UI and the scroll rails call them.
Element.prototype.scrollBy = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

globalThis.ResizeObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

Object.defineProperty(window, "matchMedia", {
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
	writable: true,
});
