import { StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

// TrainFit Mobile UI Design System - Typography
export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 26,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  
  // Secondary text
  secondary: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  secondarySmall: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  
  // Tertiary text
  tertiary: {
    fontSize: 14,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  tertiarySmall: {
    fontSize: 12,
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  // Label text
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  
  // Caption text
  caption: {
    fontSize: 12,
    color: Colors.text.tertiary,
    lineHeight: 16,
  },
  
  // Link text
  link: {
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: 'none',
  },
  linkSmall: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'none',
  },
  
  // Error text
  error: {
    fontSize: 14,
    color: Colors.status.error,
    marginTop: 4,
  },
  
  // Success text
  success: {
    fontSize: 14,
    color: Colors.status.success,
    marginTop: 4,
  },
});