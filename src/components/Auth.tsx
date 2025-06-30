import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [useFullName, setUseFullName] = useState(true); // Toggle state for Full Name vs Username
  const themeColors = useThemeColors();

  /**
   * Validates the form inputs
   */
  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    if (isSignUp) {
      if (useFullName && !fullName.trim()) {
        Alert.alert('Validation Error', 'Full Name is required');
        return false;
      }
      if (!useFullName && !username.trim()) {
        Alert.alert('Validation Error', 'Username is required');
        return false;
      }
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  /**
   * Signs in existing user with email and password
   */
  async function signInWithEmail() {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Sign In Error', error.message);
      }
    } catch (error) {
      Alert.alert('Sign In Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Signs up new user and creates their profile
   */
  async function signUpWithEmail() {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Create the auth user with metadata for the trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: useFullName ? fullName.trim() : '',
            email: email.trim(),
            username: !useFullName ? username.trim() : '',
            about: about.trim(),
          },
        },
      });

      if (authError) {
        Alert.alert('Sign Up Error', authError.message);
        return;
      }

      if (!authData.user) {
        Alert.alert('Sign Up Error', 'Failed to create user account');
        return;
      }

      // Profile will be created automatically by database trigger
      // No need for manual profile creation here

      if (!authData.session) {
        Alert.alert(
          'Check Your Email', 
          'Please check your inbox for an email verification link before signing in.'
        );
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
        setPassword(''); // Clear password for security
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      Alert.alert('Sign Up Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Toggles between sign in and sign up modes
   */
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword(''); // Clear password when switching modes
    if (!isSignUp) {
      setFullName(''); // Clear full name when switching to sign in
      setUsername(''); // Clear username when switching to sign in
      setAbout(''); // Clear about when switching to sign in
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4 max-w-md mx-auto w-full">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-center" style={{ color: themeColors.foreground }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text className="text-center mt-2" style={{ color: themeColors.mutedForeground }}>
              {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
            </Text>
          </View>

          {/* Toggle between Full Name and Username - Only shown during sign up */}
          {isSignUp && (
            <View className="py-2">
              <View className="flex-row items-center justify-center mb-3">
                <TouchableOpacity
                  onPress={() => setUseFullName(true)}
                  className="flex-1 py-2 rounded-l-md"
                  style={{ 
                    backgroundColor: useFullName ? themeColors.primary : themeColors.muted,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                  }}
                >
                  <Text 
                    className="text-center font-medium" 
                    style={{ 
                      color: useFullName ? themeColors.primaryForeground : themeColors.mutedForeground 
                    }}
                  >
                    Full Name
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setUseFullName(false)}
                  className="flex-1 py-2 rounded-r-md"
                  style={{ 
                    backgroundColor: !useFullName ? themeColors.primary : themeColors.muted,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    marginLeft: -1,
                  }}
                >
                  <Text 
                    className="text-center font-medium" 
                    style={{ 
                      color: !useFullName ? themeColors.primaryForeground : themeColors.mutedForeground 
                    }}
                  >
                    Username
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Full Name Field */}
              {useFullName && (
                <View>
                  <Text className="mb-1 ml-1" style={{ color: themeColors.foreground }}>Full Name *</Text>
                  <View className="flex-row items-center border rounded-md p-3" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <View className="w-8 items-center">
                      <FontAwesome name="user" size={20} color={themeColors.mutedForeground} />
                    </View>
                    <TextInput
                      className="flex-1 text-base ml-2"
                      style={{ color: themeColors.foreground }}
                      onChangeText={(text) => setFullName(text)}
                      value={fullName}
                      placeholder="Enter your full name"
                      placeholderTextColor={themeColors.mutedForeground}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}

              {/* Username Field */}
              {!useFullName && (
                <View>
                  <Text className="mb-1 ml-1" style={{ color: themeColors.foreground }}>Username *</Text>
                  <View className="flex-row items-center border rounded-md p-3" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                    <View className="w-8 items-center">
                      <FontAwesome name="at" size={20} color={themeColors.mutedForeground} />
                    </View>
                    <TextInput
                      className="flex-1 text-base ml-2"
                      style={{ color: themeColors.foreground }}
                      onChangeText={(text) => setUsername(text)}
                      value={username}
                      placeholder="Choose a username"
                      placeholderTextColor={themeColors.mutedForeground}
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Email Field */}
          <View className="py-2">
            <Text className="mb-1 ml-1" style={{ color: themeColors.foreground }}>Email *</Text>
            <View className="flex-row items-center border rounded-md p-3" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
              <View className="w-8 items-center">
                <FontAwesome name="envelope" size={20} color={themeColors.mutedForeground} />
              </View>
              <TextInput
                className="flex-1 text-base ml-2"
                style={{ color: themeColors.foreground }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@example.com"
                placeholderTextColor={themeColors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="py-2">
            <Text className="mb-1 ml-1" style={{ color: themeColors.foreground }}>Password *</Text>
            <View className="flex-row items-center border rounded-md p-3" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
              <View className="w-8 items-center">
                <FontAwesome name="lock" size={24} color={themeColors.mutedForeground} />
              </View>
              <TextInput
                className="flex-1 text-base ml-2"
                style={{ color: themeColors.foreground }}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder={isSignUp ? "At least 6 characters" : "Enter password"}
                placeholderTextColor={themeColors.mutedForeground}
                autoCapitalize="none"
                returnKeyType="done"
                autoComplete="password"
              />
            </View>
          </View>

          {/* About Field - Only shown during sign up */}
          {isSignUp && (
            <View className="py-2">
              <Text className="mb-1 ml-1" style={{ color: themeColors.foreground }}>About</Text>
              <View className="border rounded-md p-3" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
                <TextInput
                  className="text-base"
                  style={{ color: themeColors.foreground, minHeight: 60 }}
                  onChangeText={(text) => setAbout(text)}
                  value={about}
                  placeholder="This will appear on your public profile to let other users know what kind of content you share."
                  placeholderTextColor={themeColors.mutedForeground}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </View>
            </View>
          )}

          {/* Sign In/Sign Up Button */}
          <View className="py-2 mt-6">
            <TouchableOpacity
              disabled={isLoading}
              onPress={isSignUp ? signUpWithEmail : signInWithEmail}
              className="rounded-md py-3 items-center justify-center"
              style={{ 
                backgroundColor: isLoading ? themeColors.muted : themeColors.primary,
                opacity: isLoading ? 0.6 : 1
              }}
            >
              <Text className="text-base font-bold" style={{ color: themeColors.primaryForeground }}>
                {isLoading ? 'Loading...' : (isSignUp ? 'Sign up' : 'Sign in')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Between Sign In/Sign Up */}
          <View className="py-2">
            <TouchableOpacity
              disabled={isLoading}
              onPress={toggleMode}
              className="py-3 items-center justify-center"
            >
              <Text className="text-base" style={{ color: themeColors.mutedForeground }}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text className="font-semibold" style={{ color: themeColors.primary }}>
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Required Fields Note */}
          <View className="mt-4">
            <Text className="text-xs text-center" style={{ color: themeColors.mutedForeground }}>
              * Required fields
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}