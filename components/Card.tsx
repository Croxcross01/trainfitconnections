import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewProps, 
  ViewStyle,
  TouchableOpacity
} from 'react-native';
import Colors from '@/constants/colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  ...props 
}) => {
  // Use TouchableOpacity if onPress is provided, otherwise use View
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});