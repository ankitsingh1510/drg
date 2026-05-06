import React from 'react';
import { Text, TextProps } from 'react-native';

export interface AppTextProps extends TextProps {
  className?: string;
}

export const AppText: React.FC<AppTextProps> = ({ style, className = '', children, ...props }) => {
  return (
    <Text className={`font-outfit ${className}`} style={style} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
