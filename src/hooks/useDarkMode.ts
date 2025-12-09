import { useTheme } from '../contexts/ThemeContext';

export function useDarkMode() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    isDark,
    theme,
    // Backgrounds - GitHub/Vercel style
    bgPrimary: isDark ? 'bg-[#0d1117]' : 'bg-white',
    bgSecondary: isDark ? 'bg-[#161b22]' : 'bg-gray-50',
    bgCard: isDark ? 'bg-[#161b22]' : 'bg-white',
    
    // Texts
    textPrimary: isDark ? 'text-white' : 'text-[#3D4756]',
    textSecondary: isDark ? 'text-[#e2e8f0]' : 'text-gray-600',
    textMuted: isDark ? 'text-[#94a3b8]' : 'text-gray-500',
    
    // Borders
    border: isDark ? 'border-[#30363d]' : 'border-gray-100',
    borderStrong: isDark ? 'border-[#30363d]' : 'border-gray-200',
    
    // Inputs
    inputBg: isDark ? 'bg-[#0d1117]' : 'bg-white',
    inputBorder: isDark ? 'border-[#30363d]' : 'border-gray-200',
    inputText: isDark ? 'text-white' : 'text-[#3D4756]',
    inputPlaceholder: isDark ? 'placeholder-[#94a3b8]' : 'placeholder-gray-400',
    
    // Hover states
    hover: isDark ? 'hover:bg-[#1f6feb1a]' : 'hover:bg-gray-50',
    hoverBg: isDark ? 'hover:bg-[#161b22]' : 'hover:bg-gray-100',
    
    // Sidebar
    sidebarBg: isDark ? 'bg-[#0d1117]' : 'bg-white',
    sidebarItemActive: isDark ? 'bg-[#1f6feb26]' : 'bg-[#63E6BE] bg-opacity-20',
    sidebarItemHover: isDark ? 'hover:bg-[#1f6feb1a]' : 'hover:bg-gray-100',
    sidebarIconActive: isDark ? 'text-white' : 'text-[#3D4756]',
    sidebarIconInactive: isDark ? 'text-[#94a3b8]' : 'text-gray-500',
    sidebarTextActive: isDark ? 'text-white' : 'text-[#3D4756]',
    sidebarTextInactive: isDark ? 'text-[#e2e8f0]' : 'text-gray-600',
    
    // Tables
    tableHeader: isDark 
      ? 'bg-[#161b22] border-b border-[#30363d]' 
      : 'bg-gradient-to-r from-[#63E6BE] to-[#3D4756]',
    tableRow: isDark ? 'hover:bg-[#1f6feb1a]' : 'hover:bg-[#63E6BE] hover:bg-opacity-10',
    tableHeaderText: isDark ? 'text-[#e2e8f0]' : 'text-white',
    
    // Modals
    modalBg: isDark ? 'bg-[#161b22]' : 'bg-white',
    modalOverlay: isDark ? 'bg-black bg-opacity-80' : 'bg-black bg-opacity-50',
    
    // Tags/Badges
    tagBg: isDark ? 'bg-[#1f6feb26]' : 'bg-gray-100',
    tagText: isDark ? 'text-[#58a6ff]' : 'text-gray-700',
    
    // Helpers
    getStyle: (lightColor: string, darkColor: string) => isDark ? darkColor : lightColor,
  };
}
