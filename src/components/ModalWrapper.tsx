/**
 * @file ModalWrapper component for consistent modal presentation
 * Provides a reusable modal container with header, title, and dismiss button
 */

import { useThemeColors } from '@/hooks/useThemeColors';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalWrapperProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when the modal should be closed */
  onClose: () => void;
  /** Title to display in the header */
  title: string;
  /** Children to render in the modal body */
  children: React.ReactNode;
  /** Whether to use KeyboardAvoidingView (default: false) */
  avoidKeyboard?: boolean;
  /** Presentation style for the modal (default: 'pageSheet') */
  presentationStyle?: 'pageSheet' | 'fullScreen' | 'formSheet' | 'overFullScreen';
  /** Animation type for the modal (default: 'slide') */
  animationType?: 'none' | 'slide' | 'fade';
}

/**
 * Reusable modal wrapper component with consistent styling
 * 
 * @param props - Component props
 * @returns JSX element for modal wrapper
 */
export default function ModalWrapper({
  visible,
  onClose,
  title,
  children,
  avoidKeyboard = false,
  presentationStyle = 'pageSheet',
  animationType = 'slide',
}: ModalWrapperProps) {
  const themeColors = useThemeColors();
  const content = (
    <>
      {/* Header */}
      <View className="relative flex-row items-center justify-center p-4 border-b" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
        <Text className="text-lg font-semibold" style={{ color: themeColors.foreground }}>{title}</Text>
        <TouchableOpacity 
          onPress={onClose}
          className="absolute right-4"
        >
          <FontAwesome name="close" size={24} color={themeColors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {children}
    </>
  );

  return (
    <Modal
      animationType={animationType}
      presentationStyle={presentationStyle}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
        {avoidKeyboard ? (
          <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </SafeAreaView>
    </Modal>
  );
}