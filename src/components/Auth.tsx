import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  AppState,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../utils/supabase';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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
    if (isSignUp && !fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required');
      return false;
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
            full_name: fullName.trim(),
            email: email.trim(),
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
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center text-gray-900">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
        </Text>
      </View>

      {/* Full Name Field - Only shown during sign up */}
      {isSignUp && (
        <View className="py-2">
          <Text className="text-gray-700 mb-1 ml-1">Full Name *</Text>
          <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-white">
            <View className="w-8 items-center">
              <FontAwesome name="user" size={20} color="gray" />
            </View>
            <TextInput
              className="flex-1 text-base ml-2"
              onChangeText={(text) => setFullName(text)}
              value={fullName}
              placeholder="Enter your full name"
              placeholderTextColor="#6B7280"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </View>
      )}

      {/* Email Field */}
      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Email *</Text>
        <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-white">
          <View className="w-8 items-center">
            <FontAwesome name="envelope" size={20} color="gray" />
          </View>
          <TextInput
            className="flex-1 text-base ml-2"
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@example.com"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            autoComplete="email"
          />
        </View>
      </View>

      {/* Password Field */}
      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Password *</Text>
        <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-white">
          <View className="w-8 items-center">
            <FontAwesome name="lock" size={24} color="gray" />
          </View>
          <TextInput
            className="flex-1 text-base ml-2"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder={isSignUp ? "At least 6 characters" : "Enter password"}
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            returnKeyType="done"
            autoComplete="password"
          />
        </View>
      </View>

      {/* Sign In/Sign Up Button */}
      <View className="py-2 mt-6">
        <TouchableOpacity
          disabled={isLoading}
          onPress={isSignUp ? signUpWithEmail : signInWithEmail}
          className="bg-blue-600 rounded-md py-3 items-center justify-center active:bg-blue-700 disabled:bg-gray-400"
        >
          <Text className="text-white text-base font-bold">
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
          <Text className="text-gray-600 text-base">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text className="text-blue-600 font-semibold">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Required Fields Note */}
      <View className="mt-4">
        <Text className="text-xs text-gray-500 text-center">
          * Required fields
        </Text>
      </View>
    </View>
  );
}