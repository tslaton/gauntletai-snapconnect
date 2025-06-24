# Best Practices

- **Keep stores small and focused:** Modularize your Zustand stores to keep state management simple and maintainable.
- **Use middleware judiciously:** Only add middleware (such as `persist`, `devtools`, or `immer`) when necessary to avoid extra complexity.
- **No need for Context Providers:** Zustand does not require wrapping your app in a context provider, simplifying setup compared to Redux or Context API,
- **React Native Hooks:** Use hooks like `useEffect` and `useCallback` to manage side effects and optimize performance with Zustand.
- **Separate actions from state:** Define your state and actions (functions that update state) separately within the store for better clarity and code organization
- **Batch state updates:** When updating multiple pieces of state, batch them in a single `set` call to minimize renders and improve performance
- **Test with mocked state:** For unit testing, mock your Zustand store to isolate and test components efficiently, especially for async state changes

# Persistence and AsyncStorage

- Zustand supports state persistence via middleware, but in React Native you must use `@react-native-async-storage/async-storage` instead of `localStorage`, which is not available in React Native environments.
- When using the `persist` middleware, configure the storage option to use AsyncStorage. Failing to do so will result in errors or non-persistent state, as localStorage is not defined in React Native.
- Be aware that while the setter will update the in-memory state synchronously, persistence to AsyncStorage is asynchronous. This can occasionally lead to race conditions or state not being immediately available after an app restart.

Example:
```js
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      // state and actions
    }),
    { name: 'my-storage', getStorage: () => AsyncStorage }
  )
);
```

# Rerenders and Performance

- Zustand updates can cause unnecessary rerenders if you select large or deeply nested objects from the store. Use selector functions and `useMemo` to pick only the state you need in each component, and consider Zustand's `useShallow` utility to prevent unnecessary rerenders when working with objects or arrays.
- If you experience excessive component rerendering (e.g., with components like `react-native-video`), review your selector usage and avoid pulling the entire store into a component.

Example: 
```js
const selectUser = state => state.user;
const user = useStore(selectUser);
```
