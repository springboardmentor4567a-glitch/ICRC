// Dynamic CSS Theme Manager
class ThemeManager {
  constructor() {
    this.root = document.documentElement;
    this.themes = {
      default: {
        // Colors
        primaryBg: '#f8f9fa',
        secondaryBg: '#ffffff',
        textColor: '#333',
        primaryBlue: '#003366',
        primaryBlueHover: '#002244',
        borderColor: '#e1e5e9',
        focusBorder: '#003366',
        focusShadow: 'rgba(0, 51, 102, 0.1)',
        focusBg: '#fafbfc',
        disabledBg: '#ccc',
        spinnerBg: '#f3f3f3',

        // Spacing
        bodyPadding: '10px',
        containerPadding: '40px',
        containerMaxWidth: '600px',
        formGroupMargin: '20px',
        labelMargin: '8px',
        inputPaddingY: '8px',
        inputPaddingX: '12px',
        buttonPaddingY: '16px',
        buttonPaddingX: '24px',

        // Typography
        fontFamily: "'Arial', sans-serif",
        lineHeight: '1.6',
        h2Margin: '30px',
        labelFontSize: '16px',
        inputFontSize: '14px',
        buttonFontSize: '18px',

        // Borders and Shadows
        borderWidth: '2px',
        borderRadius: '6px',
        borderRadiusSmall: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        buttonShadow: '0 4px 12px rgba(0, 51, 102, 0.3)',

        // Sizes
        textareaMinHeight: '80px',
        buttonMinHeight: '56px',
        spinnerSize: '20px',

        // Transitions
        transitionDuration: '0.3s',
        transitionTiming: 'ease'
      },
      dark: {
        primaryBg: '#1a1a1a',
        secondaryBg: '#2d2d2d',
        textColor: '#ffffff',
        primaryBlue: '#4a90e2',
        primaryBlueHover: '#357abd',
        borderColor: '#404040',
        focusBorder: '#4a90e2',
        focusShadow: 'rgba(74, 144, 226, 0.2)',
        focusBg: '#3d3d3d',
        disabledBg: '#666',
        spinnerBg: '#404040'
      },
      compact: {
        bodyPadding: '5px',
        containerPadding: '20px',
        formGroupMargin: '10px',
        labelMargin: '4px',
        inputPaddingY: '6px',
        inputPaddingX: '8px',
        buttonPaddingY: '12px',
        buttonPaddingX: '16px',
        h2Margin: '15px',
        labelFontSize: '14px',
        inputFontSize: '12px',
        buttonFontSize: '16px',
        textareaMinHeight: '60px',
        buttonMinHeight: '44px',
        spinnerSize: '16px'
      },
      spacious: {
        bodyPadding: '20px',
        containerPadding: '60px',
        formGroupMargin: '30px',
        labelMargin: '12px',
        inputPaddingY: '12px',
        inputPaddingX: '16px',
        buttonPaddingY: '20px',
        buttonPaddingX: '32px',
        h2Margin: '40px',
        labelFontSize: '18px',
        inputFontSize: '16px',
        buttonFontSize: '20px',
        textareaMinHeight: '100px',
        buttonMinHeight: '64px',
        spinnerSize: '24px'
      },
      ocean: {
        primaryBg: '#e3f2fd',
        secondaryBg: '#ffffff',
        textColor: '#0d47a1',
        primaryBlue: '#1976d2',
        primaryBlueHover: '#1565c0',
        borderColor: '#bbdefb',
        focusBorder: '#1976d2',
        focusShadow: 'rgba(25, 118, 210, 0.2)',
        focusBg: '#f3e5f5',
        disabledBg: '#e1f5fe',
        spinnerBg: '#e1f5fe'
      },
      forest: {
        primaryBg: '#f1f8e9',
        secondaryBg: '#ffffff',
        textColor: '#1b5e20',
        primaryBlue: '#388e3c',
        primaryBlueHover: '#2e7d32',
        borderColor: '#c8e6c9',
        focusBorder: '#388e3c',
        focusShadow: 'rgba(56, 142, 60, 0.2)',
        focusBg: '#e8f5e8',
        disabledBg: '#f1f8e9',
        spinnerBg: '#f1f8e9'
      },
      sunset: {
        primaryBg: '#fff3e0',
        secondaryBg: '#ffffff',
        textColor: '#e65100',
        primaryBlue: '#f57c00',
        primaryBlueHover: '#ef6c00',
        borderColor: '#ffcc02',
        focusBorder: '#f57c00',
        focusShadow: 'rgba(245, 124, 0, 0.2)',
        focusBg: '#fff8e1',
        disabledBg: '#fff3e0',
        spinnerBg: '#fff3e0'
      },
      insurance: {
        // Insurance Company Theme - Trust, Security, Professionalism
        primaryBg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
        secondaryBg: '#ffffff',
        textColor: '#1e293b',
        primaryBlue: '#1e3a8a', // Navy blue - trust and stability
        primaryBlueHover: '#1e40af',
        borderColor: '#e2e8f0',
        focusBorder: '#1e3a8a',
        focusShadow: 'rgba(30, 58, 138, 0.15)',
        focusBg: '#f8fafc',
        disabledBg: '#f1f5f9',
        spinnerBg: '#f1f5f9',

        // Professional spacing
        bodyPadding: '20px',
        containerPadding: '40px',
        containerMaxWidth: '800px',
        formGroupMargin: '24px',
        labelMargin: '8px',
        inputPaddingY: '12px',
        inputPaddingX: '16px',
        buttonPaddingY: '16px',
        buttonPaddingX: '32px',

        // Corporate typography
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: '1.6',
        h2Margin: '32px',
        labelFontSize: '16px',
        inputFontSize: '16px',
        buttonFontSize: '16px',

        // Professional borders and shadows
        borderWidth: '1px',
        borderRadius: '8px',
        borderRadiusSmall: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1)',
        buttonShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',

        // Insurance-appropriate sizes
        textareaMinHeight: '120px',
        buttonMinHeight: '52px',
        spinnerSize: '20px',

        // Smooth transitions
        transitionDuration: '0.3s',
        transitionTiming: 'ease-in-out'
      }
    };
  }

  // Apply a complete theme
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme "${themeName}" not found. Available themes:`, Object.keys(this.themes));
      return;
    }

    const theme = this.themes[themeName];
    Object.entries(theme).forEach(([property, value]) => {
      this.setCSSVariable(property, value);
    });

    console.log(`Applied theme: ${themeName}`);
  }

  // Set a single CSS variable
  setCSSVariable(property, value) {
    const cssProperty = `--${this.camelToKebab(property)}`;
    this.root.style.setProperty(cssProperty, value);
  }

  // Get a CSS variable value
  getCSSVariable(property) {
    const cssProperty = `--${this.camelToKebab(property)}`;
    return getComputedStyle(this.root).getPropertyValue(cssProperty).trim();
  }

  // Update multiple variables at once
  updateVariables(variables) {
    Object.entries(variables).forEach(([property, value]) => {
      this.setCSSVariable(property, value);
    });
  }

  // Reset to default theme
  resetToDefault() {
    this.applyTheme('default');
  }

  // Create a custom theme
  createCustomTheme(themeName, variables) {
    this.themes[themeName] = { ...this.themes.default, ...variables };
  }

  // Get all available themes
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  // Helper function to convert camelCase to kebab-case
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Animate variable changes
  animateVariable(property, fromValue, toValue, duration = 1000) {
    const startTime = performance.now();
    const cssProperty = `--${this.camelToKebab(property)}`;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Simple linear interpolation for numeric values
      if (typeof fromValue === 'number' && typeof toValue === 'number') {
        const currentValue = fromValue + (toValue - fromValue) * progress;
        this.root.style.setProperty(cssProperty, currentValue + 'px');
      } else {
        // For non-numeric values, just set the target value at the end
        if (progress >= 1) {
          this.root.style.setProperty(cssProperty, toValue);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Export current theme
  exportCurrentTheme() {
    const currentTheme = {};
    const styles = getComputedStyle(this.root);

    // Get all CSS variables
    Object.keys(this.themes.default).forEach(property => {
      const cssProperty = `--${this.camelToKebab(property)}`;
      currentTheme[property] = styles.getPropertyValue(cssProperty).trim();
    });

    return currentTheme;
  }

  // Import theme from object
  importTheme(themeObject) {
    this.updateVariables(themeObject);
  }
}

// Create global instance
window.themeManager = new ThemeManager();

// Initialize with default theme on page load
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager.applyTheme('default');
});

// Add to window for easy access
window.applyTheme = (themeName) => window.themeManager.applyTheme(themeName);
window.setCSSVariable = (property, value) => window.themeManager.setCSSVariable(property, value);
window.getCSSVariable = (property) => window.themeManager.getCSSVariable(property);

// Example usage:
// applyTheme('dark');
// applyTheme('compact');
// setCSSVariable('primaryBlue', '#ff0000');
// getCSSVariable('primaryBlue');
