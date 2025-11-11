export const COLORS = {
  primary: '#6C63FF',
  secondary: '#A78BFA',
  accent: '#EC4899',
  background: '#F8F9FF',
  cardBackground: '#FFFFFF',
  text: '#2D3748',
  textLight: '#718096',
  success: '#48BB78',
  warning: '#F6AD55',
  error: '#F56565',
  border: '#E2E8F0',
  gradient1: '#6C63FF',
  gradient2: '#A78BFA',
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
  
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 16,
  body: 14,
  small: 12,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  extraStrong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.light,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
};
