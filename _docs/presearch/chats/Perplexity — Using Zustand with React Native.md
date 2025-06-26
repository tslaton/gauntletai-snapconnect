https://www.perplexity.ai/search/a3adaf18-809d-47cb-b8fd-e38bab65aeaa

## Gotchas and Considerations When Using Zustand with React Native

Zustand is widely regarded as a simple, fast, and effective state management library that works well with React Native, offering a much lighter alternative to Redux or even React Context for global state[5](https://peerdh.com/blogs/programming-insights/using-zustand-for-state-management-in-a-react-native-app)[7](https://blog.peslostudios.com/blog/zustand-state-management-in-react-native/)[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2). However, there are some important "gotchas" and best practices to be aware of when integrating Zustand into a React Native project.

**Persistence and AsyncStorage**

- Zustand supports state persistence via middleware, but in React Native you must use `@react-native-async-storage/async-storage` instead of `localStorage`, which is not available in React Native environments[4](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)[13](https://github.com/pmndrs/zustand/discussions/1533).
    
- When using the `persist` middleware, configure the storage option to use AsyncStorage. Failing to do so will result in errors or non-persistent state, as localStorage is not defined in React Native[4](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)[13](https://github.com/pmndrs/zustand/discussions/1533).
    
- Be aware that while the setter will update the in-memory state synchronously, persistence to AsyncStorage is asynchronous. This can occasionally lead to race conditions or state not being immediately available after an app restart[12](https://github.com/pmndrs/zustand/issues/394).
    

**Rerenders and Performance**

- Zustand updates can cause unnecessary rerenders if you select large or deeply nested objects from the store. Use selector functions to pick only the state you need in each component, and consider Zustand's `useShallow` utility to prevent unnecessary rerenders when working with objects or arrays[11](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)[6](https://blog.stackademic.com/best-practices-for-using-zustand-in-a-react-app-cc6b1a289ee6?gi=bd1ad0ac2857).
    
- If you experience excessive component rerendering (e.g., with components like `react-native-video`), review your selector usage and avoid pulling the entire store into a component[15](https://stackoverflow.com/questions/77185318/react-native-video-component-refreshing-excessively-on-zustand-state-updates-cau).
    

**Combining with Other State Management Libraries**

- Zustand is best used for local or app state, not server/cache state. For server state (API data), libraries like React Query (TanStack Query) are better suited. Mixing Zustand and React Query is possible, but can introduce complexity and code duplication if not managed carefully[1](https://www.reddit.com/r/reactnative/comments/1cu1d8c/do_we_need_to_use_zustand_along_with_react_query/)[10](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/).
    
- If you use both, avoid duplicating server state in Zustand unless you have a specific reason (e.g., transforming or enriching the data for client-side use)[1](https://www.reddit.com/r/reactnative/comments/1cu1d8c/do_we_need_to_use_zustand_along_with_react_query/).
    

**Best Practices**

- **Keep stores small and focused:** Modularize your Zustand stores to keep state management simple and maintainable[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2).
    
- **Use middleware judiciously:** Only add middleware (such as `persist`, `devtools`, or `immer`) when necessary to avoid extra complexity[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2).
    
- **No need for Context Providers:** Zustand does not require wrapping your app in a context provider, simplifying setup compared to Redux or Context API[7](https://blog.peslostudios.com/blog/zustand-state-management-in-react-native/)[10](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/).
    
- **React Native Hooks:** Use hooks like `useEffect` and `useCallback` to manage side effects and optimize performance with Zustand[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2).
    

**Other Considerations**

- **Devtools:** Zustand has devtools support, but integration in React Native is less seamless than in web environments. Debugging may require additional setup or custom logging[10](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/).
    
- **TypeScript:** Zustand works well with TypeScript, but take care to type your store and actions properly for better maintainability and auto-completion[4](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)[5](https://peerdh.com/blogs/programming-insights/using-zustand-for-state-management-in-a-react-native-app).
    

## Summary Table: Common Gotchas

|Gotcha/Consideration|Details/Workaround|
|---|---|
|Persistence|Use AsyncStorage, not localStorage; configure `persist` accordingly[4](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)[13](https://github.com/pmndrs/zustand/discussions/1533)|
|Rerenders|Use selectors and `useShallow` to avoid unnecessary rerenders[11](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)[15](https://stackoverflow.com/questions/77185318/react-native-video-component-refreshing-excessively-on-zustand-state-updates-cau)|
|Mixing with React Query|Avoid duplicating server state; use each tool for its strength[1](https://www.reddit.com/r/reactnative/comments/1cu1d8c/do_we_need_to_use_zustand_along_with_react_query/)|
|Middleware|Only use when needed; adds complexity[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2)|
|Devtools|Limited/dev setup needed in React Native[10](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/)|

## Conclusion

Zustand works very well with React Native and is a popular choice for its simplicity and performance. The main "gotchas" relate to persistence (using AsyncStorage), managing rerenders, and careful integration with other state management solutions. By following best practices—keeping stores modular, using selectors, and configuring persistence correctly—you can avoid most pitfalls and enjoy a smooth development experience[4](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)[5](https://peerdh.com/blogs/programming-insights/using-zustand-for-state-management-in-a-react-native-app)[8](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2)[11](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)[15](https://stackoverflow.com/questions/77185318/react-native-video-component-refreshing-excessively-on-zustand-state-updates-cau).

1. [https://www.reddit.com/r/reactnative/comments/1cu1d8c/do_we_need_to_use_zustand_along_with_react_query/](https://www.reddit.com/r/reactnative/comments/1cu1d8c/do_we_need_to_use_zustand_along_with_react_query/)
2. [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
3. [https://www.youtube.com/watch?v=U2Hg-MAAz_M](https://www.youtube.com/watch?v=U2Hg-MAAz_M)
4. [https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist](https://stackoverflow.com/questions/73075620/react-native-with-zustand-persist)
5. [https://peerdh.com/blogs/programming-insights/using-zustand-for-state-management-in-a-react-native-app](https://peerdh.com/blogs/programming-insights/using-zustand-for-state-management-in-a-react-native-app)
6. [https://blog.stackademic.com/best-practices-for-using-zustand-in-a-react-app-cc6b1a289ee6?gi=bd1ad0ac2857](https://blog.stackademic.com/best-practices-for-using-zustand-in-a-react-app-cc6b1a289ee6?gi=bd1ad0ac2857)
7. [https://blog.peslostudios.com/blog/zustand-state-management-in-react-native/](https://blog.peslostudios.com/blog/zustand-state-management-in-react-native/)
8. [https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2](https://dev.to/ajmal_hasan/simplifying-state-management-in-react-native-with-zustand-41f2)
9. [https://tkdodo.eu/blog/zustand-and-react-context](https://tkdodo.eu/blog/zustand-and-react-context)
10. [https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/)
11. [https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
12. [https://github.com/pmndrs/zustand/issues/394](https://github.com/pmndrs/zustand/issues/394)
13. [https://github.com/pmndrs/zustand/discussions/1533](https://github.com/pmndrs/zustand/discussions/1533)
14. [https://github.com/react-spring/zustand/issues/61](https://github.com/react-spring/zustand/issues/61)
15. [https://stackoverflow.com/questions/77185318/react-native-video-component-refreshing-excessively-on-zustand-state-updates-cau](https://stackoverflow.com/questions/77185318/react-native-video-component-refreshing-excessively-on-zustand-state-updates-cau)
16. [https://kazmi066.hashnode.dev/implementing-auth-flow-in-react-native-with-zustand](https://kazmi066.hashnode.dev/implementing-auth-flow-in-react-native-with-zustand)
17. [https://www.youtube.com/watch?v=eb84PFNTFVE](https://www.youtube.com/watch?v=eb84PFNTFVE)
18. [https://www.sinasafari.com/blog/how-I-go-with-react-native](https://www.sinasafari.com/blog/how-I-go-with-react-native)
19. [https://www.youtube.com/watch?v=U2Hg-MAAz_M&vl=ja](https://www.youtube.com/watch?v=U2Hg-MAAz_M&vl=ja)
20. [https://dev.to/abeertech01/simplest-zustand-tutorial-28a8](https://dev.to/abeertech01/simplest-zustand-tutorial-28a8)