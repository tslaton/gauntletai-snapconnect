# Perplexity Q&A

> 1. Does Firebase work well with Expo and React Native? What about Supabase?

[[Perplexity — Firebase with Expo and React Native]]

Either works

> 2. What is an easier tech stack to get started with a quick demo app in 24h?
>
> 1. Expo + React (+Firebase or Supabase)
> 2. Flutter + Firebase
>
> the app will have camera, video, individual, and group messaging features. it should be able to take and perform basic edits (+ filters) to photos and videos and share them to your account + followers

[[Perplexity — Tech Stack Comparison — 24-Hour Demo App]]

Expo + React with Supabase

> 3. Consider the uploaded project scope and goals. What kinds of niches or users do you think could be better served by an app meeting the Core Clone requirements and behaving generally like SnapChat. Help me brainstorm the characteristics of the possible markets and users, as well as six user-stores for each one that I would implement

[[Gemini — User Targeting]]

1. mirco learning videos
  - project-based... hard to do from current data (youtube?)
2. nearby social connections and events for the urban explorer... dating?
  - food
  - events
  - parks
  - travel (scavenger hunt type stuff)
  - concerts
  3. gamers
4. fashion
  - can user-interview my wife...
5. college students
6. DND or other creative projects

> 4. Which is more compatible with React Native + Expo — Supabase or Firebase?

[[Perplexity — Firebase vs. Supabase in Mobile]]

[Real-time subscriptions in Supabase](https://app.studyraid.com/en/read/8395/231602/managing-real-time-subscriptions)

Pros:
- Supabase
	- familiar
	- _SQL, drizzle_
	- pricing tier is more predictable
- Firebase
	- _built-in push notifications_
	- _Gemini will be particularly adept_
	- _stronger MCP documentation_
	- pricing scales a little better

Cons:
- Supabase
	- **read-only MCP**
		- [supabase write-enabled mcp](https://github.com/alexander-zuev/supabase-mcp-server?tab=readme-ov-file)
	- Supabase does not support push notifications?
		- [or, does it?](https://supabase.com/docs/guides/functions/examples/push-notifications?queryGroups=platform&platform=expo)
- Firebase
	- less familiar
	- [Expo can be difficult to integrate](https://dev.to/akgoze/firebase-integration-challenges-in-react-native-4119)

> 5. Which has stronger MCP documentation — Supabase or Firebase?

[[Perplexity — Which has stronger MCP documentation — Supabase or Firebase?]]

Firebase

> 6. How could I use Supabase for push notifications for a mobile application? 

[[Gemini — Using Supabase for push notifications]]

See also [[How to — Supabase]]

> 7. Compare managing schemas in Supabase with Drizzle ORM vs. managing schemas in Firebase. The context is mobile development in a React Native or Flutter application

[[Perplexity — Managing schemas via Supabase (drizzle) vs. Firebase]]

I still prefer the approach of Supabase with Drizzle ORM

> 8. Are there any gotchas using Zustand with React Native

[[Perplexity — Using Zustand with React Native]]

Not really, aside from different localStorage. But the response gives good general advice.