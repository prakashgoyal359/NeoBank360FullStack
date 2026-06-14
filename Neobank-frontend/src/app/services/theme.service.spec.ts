import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  it('stores and applies the selected theme', () => {
    const service = new ThemeService();

    service.setTheme('dark');

    expect(service.isDarkMode()).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles between light and dark mode', () => {
    const service = new ThemeService();

    service.setTheme('light');
    service.toggleTheme();

    expect(service.getCurrentTheme()).toBe('dark');
  });
});
