import React from 'react';
import { View } from 'react-native';

interface SpacerProps {
  size?: number;
  horizontal?: boolean;
};

/**
 * Spacer component for consistent spacing in layouts
 * @param size - The size of the spacer in pixels (default: 16)
 * @param horizontal - Whether the spacer should be horizontal (width) or vertical (height)
 */
export default function Spacer({ size = 16, horizontal = false }: SpacerProps) {
  return (
    <View
      style={{
        width: horizontal ? size : 'auto',
        height: !horizontal ? size : 'auto',
      }}
    />
  )
};