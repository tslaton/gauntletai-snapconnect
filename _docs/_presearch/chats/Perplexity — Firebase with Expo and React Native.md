<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>
https://www.perplexity.ai/search/does-firebase-work-well-with-e-dsM86IC4Q6SftvLXBEc7jg

## Firebase with Expo and React Native

**Firebase works well with Expo and React Native, but the integration approach depends on your requirements and the features you need.**

### Using the Firebase JS SDK

- **Expo Managed Workflow**: The easiest way to use Firebase in an Expo app is through the Firebase JavaScript SDK (`firebase` package). This works out of the box with Expo Go and does not require any custom native code or configuration. You can use services like Authentication, Firestore, and Realtime Database this way[^1][^2][^3].
- **Setup**: Register your app as a web app in the Firebase console, grab your config, and initialize Firebase in your project. You can selectively import only the services you need (e.g., `firebase/auth`, `firebase/firestore`)[^1][^2].
- **Limitations**: Some advanced Firebase features (e.g., Crashlytics, Dynamic Links, Analytics, App Check) are *not* available via the JS SDK and require native modules[^1][^4].


### Using React Native Firebase (Native SDKs)

- **React Native Firebase** is a set of native modules that wrap the full power of the Firebase SDK for iOS and Android. This gives you access to all Firebase features, including those not available in the JS SDK[^1][^5][^6].
- **Expo Compatibility**: React Native Firebase *cannot* be used with the default Expo Go app, because it requires native code. To use it, you must build a custom development client using `expo-dev-client` and EAS Build[^1][^5][^7].
- **Setup**:
    - Install `expo-dev-client` and `@react-native-firebase/app` (plus any specific Firebase modules you need).
    - Configure your `app.json` to include your `google-services.json` and `GoogleService-Info.plist` files.
    - Rebuild your app with EAS Build to include the native code[^1][^5][^7].
- **When to Use**: Choose this route if you need advanced Firebase features or want optimal performance with native code[^1][^4].


### Summary Table: Firebase Approaches in Expo

| Approach | Expo Go Support | Native Features | Setup Complexity | Use Cases |
| :-- | :-- | :-- | :-- | :-- |
| Firebase JS SDK (`firebase` npm) | Yes | Limited | Easy | Auth, Firestore, Realtime DB, Storage (basic) |
| React Native Firebase (native) | No (needs dev client) | Full | Moderate/High | Analytics, Crashlytics, Dynamic Links, etc. |


---

## Supabase with Expo and React Native

**Supabase is designed to work seamlessly with Expo and React Native, offering a straightforward integration and a modern developer experience.**

### Integration and Features

- **Supabase provides a TypeScript/JavaScript client (`@supabase/supabase-js`)** that works directly in Expo and React Native environments[^8][^9][^10].
- **Features**: You get access to a Postgres database, authentication, storage, real-time subscriptions, and more. Supabase automatically generates a REST API from your database and uses Row Level Security (RLS) for secure, direct-from-client access[^9][^11].
- **Setup**:
    - Install `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, and `react-native-url-polyfill`[^9][^8][^10].
    - Initialize the Supabase client with your project URL and anon key. These keys are safe to use in Expo because RLS protects your data[^9][^11].
    - Example initialization:

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- **Expo Go Support**: Supabase works with Expo Go, as it does not require any custom native code[^9][^11][^8].


### Caveats

- **Device Crashes**: Some users have reported that Supabase works in Expo Go but crashes on standalone builds. These issues are often related to version mismatches or missing dependencies like `react-native-url-polyfill` or `@react-native-async-storage/async-storage`[^12]. Ensuring you follow the latest Supabase and Expo documentation typically resolves these issues.
- **Security**: Since Supabase uses RLS, your API keys are safe to include in your client code, provided you set up your database rules correctly[^11][^9].

---

## Conclusion

- **Firebase**: Works well with Expo and React Native. Use the JS SDK for most features in Expo Go. For advanced features, use React Native Firebase with a custom dev client and EAS Build[^1][^5][^4][^2].
- **Supabase**: Fully compatible with Expo and React Native, including Expo Go. The integration is simple and secure, leveraging the JS client and RLS for direct client-to-database access[^9][^8][^11][^10].

**Both Firebase and Supabase are robust options for Expo and React Native development. The best choice depends on your feature needs and workflow preferences.**

<div style="text-align: center">⁂</div>

[^1]: https://docs.expo.dev/guides/using-firebase/

[^2]: https://dev.to/dhrumitdk/how-to-integrate-firebase-with-a-react-native-expo-app-in-5-minutes-2pm5

[^3]: https://github.com/zhrgns/firebaseIntegrationForExpoGoApp

[^4]: https://www.reddit.com/r/reactnative/comments/17uz4vq/should_i_go_with_react_native_cli_or_expo_for/

[^5]: https://rnfirebase.io

[^6]: https://blog.devgenius.io/firebase-in-reactnative-72dd09a3115e

[^7]: https://stackoverflow.com/questions/74989203/confusion-integrating-react-native-firebase-with-expo

[^8]: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

[^9]: https://docs.expo.dev/guides/using-supabase/

[^10]: https://supabase.com/docs/guides/auth/quickstarts/react-native

[^11]: https://blog.richardchou.dev/react-native-expo-and-supabase-0c4c444691ad?gi=b5b06be6149f

[^12]: https://stackoverflow.com/questions/77607633/expo-with-supabase-crashes-on-device-but-works-on-expo-go

[^13]: https://www.youtube.com/watch?v=neWhzs8VvvA

[^14]: https://medium.com/@r.buenting95/integrating-supabase-databases-with-react-native-applications-7f5d4e835dba

[^15]: https://stackoverflow.com/questions/69218576/is-there-a-way-to-use-firebase-using-expo-react-native

[^16]: https://www.magicbell.com/blog/how-to-integrate-firebase-cloud-messaging-with-expo

[^17]: https://stackoverflow.com/questions/77182407/is-supabase-compatible-with-react-native-cli

[^18]: https://www.reddit.com/r/Supabase/comments/1bu1obb/can_i_supabase_as_a_backend_service_to_my_react/

[^19]: https://www.reddit.com/r/expo/comments/1iuxgx4/help_with_setting_up_expo_and_supabase/

[^20]: https://galaxies.dev/course/react-native-supabase

