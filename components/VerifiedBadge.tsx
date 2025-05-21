import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface VerifiedBadgeProps {
  size?: number;
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 24,
  style,
}) => {
  const badgeSize = size;
  const checkSize = size * 0.6;
  
  return (
    <View
      style={[
        styles.badge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
        },
        style,
      ]}
    >
      <Check size={checkSize} color="#fff" strokeWidth={3} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});