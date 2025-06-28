import { Redirect } from 'expo-router';

/**
 * Index page that redirects to the main tabs
 * The authentication check is handled in the root layout
 */
export default function Index() {
  return <Redirect href="/(tabs)/itineraries" />;
}