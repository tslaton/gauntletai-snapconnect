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
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithEmail() {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setIsLoading(false);
  }

  async function signUpWithEmail() {
    setIsLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setIsLoading(false);
  }

  return (
    <View className="mt-10 p-4 justify-center">
      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Email</Text>
        <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-white">
          <View className="w-8 items-center">
            <FontAwesome name="envelope" size={20} color="gray" />
          </View>
          <TextInput
            className="flex-1 text-base ml-2"
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View className="py-2">
        <Text className="text-gray-700 mb-1 ml-1">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-md p-3 bg-white">
          <View className="w-8 items-center">
            <FontAwesome name="lock" size={24} color="gray" />
          </View>
          <TextInput
            className="flex-1 text-base ml-2"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </View>
      </View>

      <View className="py-2 mt-4">
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => signInWithEmail()}
          className="bg-blue-600 rounded-md py-3 items-center justify-center active:bg-blue-700 disabled:bg-gray-400"
        >
          <Text className="text-white text-base font-bold">Sign in</Text>
        </TouchableOpacity>
      </View>

      <View className="py-2">
        <TouchableOpacity
          disabled={isLoading}
          onPress={() => signUpWithEmail()}
          className="bg-gray-700 rounded-md py-3 items-center justify-center active:bg-gray-800 disabled:bg-gray-400"
        >
          <Text className="text-white text-base font-bold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}