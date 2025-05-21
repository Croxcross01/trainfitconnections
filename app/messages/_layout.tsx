import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.dark,
        },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.background.dark,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Messages',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}