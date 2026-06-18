import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { MainTabs } from './MainTabs';
import { useTheme } from '../context/AppContext';

/** 根导航容器 */
export function RootNavigator() {
  const { isDark, colors } = useTheme();

  const theme = isDark
    ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, primary: colors.primary, background: colors.background, card: colors.card, text: colors.text, border: colors.border },
      }
    : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background, card: colors.card, text: colors.text, border: colors.border },
      };

  return (
    <NavigationContainer theme={theme}>
      <MainTabs />
    </NavigationContainer>
  );
}
