import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

type IconName = 'house.fill' | 'paperplane.fill' | 'chevron.left.forwardslash.chevron.right' | 
                'chevron.right' | 'cart.fill' | 'clock.fill' | 'gear' | 'qrcode.viewfinder' |
                'trash.fill' | 'pencil' | 'plus' | 'minus' | 'arrow.left' | 'arrow.right' |
                'checkmark' | 'xmark' | 'barcode.viewfinder' | 'doc.text' | 'doc.text.fill' |
                'printer' | 'bag' | 'bag.fill' | 'magnifyingglass';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
