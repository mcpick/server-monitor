import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../theme';

function wrapper({ children }: { children: ReactNode }): React.JSX.Element {
    return <ThemeProvider>{children}</ThemeProvider>;
}

function mockMatchMedia(matches: boolean): MediaQueryList {
    return {
        matches,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
}

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        window.matchMedia = vi.fn().mockImplementation(() => mockMatchMedia(false));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns system theme by default', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });
        expect(result.current.theme).toBe('system');
    });

    it('can set theme to dark', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setTheme('dark');
        });

        expect(result.current.theme).toBe('dark');
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('can set theme to light', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setTheme('light');
        });

        expect(result.current.theme).toBe('light');
        expect(result.current.resolvedTheme).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persists theme preference to localStorage', () => {
        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
            result.current.setTheme('dark');
        });

        expect(localStorage.getItem('server-monitor-theme')).toBe('dark');
    });

    it('loads theme from localStorage', () => {
        localStorage.setItem('server-monitor-theme', 'dark');

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.theme).toBe('dark');
    });

    it('throws when used outside of ThemeProvider', () => {
        expect(() => {
            renderHook(() => useTheme());
        }).toThrow('useTheme must be used within a ThemeProvider');
    });
});
