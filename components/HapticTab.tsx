import * as Haptics from 'expo-haptics';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function HapticTab({ children, ...props }: BottomTabBarButtonProps) {
  const { isDark } = useTheme();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // @ts-ignore
    props?.onPress?.();
  };

  // Filter out null values from props
  const touchableProps = Object.fromEntries(
    Object.entries(props).filter(([_, value]) => value !== null)
  );

  return (
    <TouchableOpacity
      {...touchableProps}
      delayLongPress={props.delayLongPress ?? undefined}
      onPress={handlePress}
      accessibilityRole="button"
      style={props.style}
    >
      {children}
    </TouchableOpacity>
  );
}
