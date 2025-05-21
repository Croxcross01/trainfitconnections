import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View
} from 'react-native';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size],
      ...(fullWidth && styles.fullWidth),
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...styles[`${variant}Disabled`],
        ...style,
      };
    }

    return {
      ...baseStyle,
      ...styles[variant],
      ...style,
    };
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...styles[`${variant}DisabledText`],
        ...textStyle,
      };
    }

    return {
      ...baseStyle,
      ...styles[`${variant}Text`],
      ...textStyle,
    };
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator 
          color={
            variant === 'outline' || variant === 'text' 
              ? Colors.primary 
              : Colors.text.inverse
          } 
          size="small" 
        />
      );
    }

    if (icon && iconPosition === 'left') {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      );
    }

    if (icon && iconPosition === 'right') {
      return (
        <View style={styles.contentContainer}>
          <Text style={getTextStyle()}>{title}</Text>
          <View style={styles.iconContainer}>{icon}</View>
        </View>
      );
    }

    return <Text style={getTextStyle()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={getButtonStyle()}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Size variants
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  smallText: {
    ...typography.buttonSmall,
  },
  mediumText: {
    ...typography.button,
  },
  largeText: {
    ...typography.button,
    fontSize: 18,
  },
  
  // Button variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  destructive: {
    backgroundColor: Colors.status.error,
  },
  
  // Text variants
  primaryText: {
    color: Colors.text.inverse,
  },
  secondaryText: {
    color: Colors.text.inverse,
  },
  outlineText: {
    color: Colors.primary,
  },
  textText: {
    color: Colors.primary,
  },
  destructiveText: {
    color: Colors.text.inverse,
  },
  
  // Disabled states
  primaryDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  secondaryDisabled: {
    backgroundColor: '#9CA3AF',
  },
  outlineDisabled: {
    borderColor: '#9CA3AF',
  },
  textDisabled: {
    backgroundColor: 'transparent',
  },
  textButtonDisabled: {
    backgroundColor: 'transparent',
  },
  destructiveDisabled: {
    backgroundColor: '#9CA3AF',
  },
  
  // Disabled text states
  primaryDisabledText: {
    color: Colors.text.tertiary,
  },
  secondaryDisabledText: {
    color: Colors.text.tertiary,
  },
  outlineDisabledText: {
    color: '#9CA3AF',
  },
  textDisabledText: {
    color: '#9CA3AF',
  },
  textButtonDisabledText: {
    color: '#9CA3AF',
  },
  destructiveDisabledText: {
    color: Colors.text.tertiary,
  },
});