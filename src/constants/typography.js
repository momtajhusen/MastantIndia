// src/constants/typography.js
export const FONTS = {
    // Font families
    primary: Platform.OS === 'ios' ? 'System' : 'Roboto',
    secondary: Platform.OS === 'ios' ? 'System' : 'Roboto',
    
    // Font sizes
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      title: 24,
      heading: 28,
      display: 32,
    },
    
    // Font weights
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
      extraBold: '800',
    },
    
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  };
  
  // Text styles
  export const TEXT_STYLES = {
    // Headings
    h1: {
      fontSize: FONTS.sizes.display,
      fontWeight: FONTS.weights.bold,
      lineHeight: FONTS.sizes.display * FONTS.lineHeights.tight,
    },
    h2: {
      fontSize: FONTS.sizes.heading,
      fontWeight: FONTS.weights.bold,
      lineHeight: FONTS.sizes.heading * FONTS.lineHeights.tight,
    },
    h3: {
      fontSize: FONTS.sizes.title,
      fontWeight: FONTS.weights.semiBold,
      lineHeight: FONTS.sizes.title * FONTS.lineHeights.normal,
    },
    
    // Body text
    body: {
      fontSize: FONTS.sizes.lg,
      fontWeight: FONTS.weights.regular,
      lineHeight: FONTS.sizes.lg * FONTS.lineHeights.normal,
    },
    bodySmall: {
      fontSize: FONTS.sizes.md,
      fontWeight: FONTS.weights.regular,
      lineHeight: FONTS.sizes.md * FONTS.lineHeights.normal,
    },
    
    // Labels
    label: {
      fontSize: FONTS.sizes.md,
      fontWeight: FONTS.weights.medium,
    },
    labelSmall: {
      fontSize: FONTS.sizes.sm,
      fontWeight: FONTS.weights.medium,
    },
    
    // Captions
    caption: {
      fontSize: FONTS.sizes.sm,
      fontWeight: FONTS.weights.regular,
    },
    
    // Button text
    button: {
      fontSize: FONTS.sizes.lg,
      fontWeight: FONTS.weights.semiBold,
    },
  };
  
  // ========================================