import React from 'react';
import { Text, TextProps } from 'react-native';

type FontWeight = 'regular' | 'thin' | 'extralight' | 'light' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

const weightClass: Record<FontWeight, string> = {
  regular: 'font-outfit',
  thin: 'font-outfit-thin',
  extralight: 'font-outfit-extralight',
  light: 'font-outfit-light',
  medium: 'font-outfit-medium',
  semibold: 'font-outfit-semibold',
  bold: 'font-outfit-bold',
  extrabold: 'font-outfit-extrabold',
  black: 'font-outfit-black',
};

export interface AppTextProps extends TextProps {
  className?: string;
  weight?: FontWeight;
}

export const AppText: React.FC<AppTextProps> = ({ style, className = '', weight = 'regular', children, ...props }) => {
  return (
    <Text className={`${weightClass[weight]} ${className}`} style={style} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
