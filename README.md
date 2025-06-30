# SnapConnect

## Mission

Provide itinerary suggestions, travel-blog type content creation, and social connection for travelers

RAG-enabled value-adds

1. **Activity** / **Itinerary** completer

User has incomplete data or doesn't want to enter all of it -> AI can fill in the blanks (and generate cover images)

2. **Activity creations**

User can give instructions to create an activity from scratch

eg., "I want to see the coolest temples in Tokyo" -> RAG pulls in temples in Tokyo, Tripadvisor ratings -> suggests some

User adds these to their bag of things they want to do.

3. **Day planner**

eg., "help me plan my day" -> RAG pulls weather, user's "want to do" + fills in gaps with general trip preferences -> makes a plan for the day
 
4. **Itinerary planner**

eg., "make me an itinerary for a five-day trip to Tokyo" -> RAG takes planned days and general trip goals and combines them with 


5. **Caption generation**

pull location from photo and context of trip -> generate a compelling caption

6. **Recommend user content related to trip**

Suggest user-posted "stories" that have overlap with your itineraries/activity locations

7. **Highlight reels**

Collection of user photos uploaded during trip -> tell the story over time and place with choice photos

This can be personal or uploaded "blog" style _not finished_

# Expo

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Development
- [repo](https://github.com/tslaton/gauntletai-snapconnect)

### Installation and running

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### Supabase

1. Set environment variables 

- Check `.env.example` for the env vars you need to set. It is best if your local supabase url is your IPv4 address rather than localhost, so the phone will connect to it as if it's a remote. You can find it on Mac under TCP/IP "Details..." in the WiFi settings.

2. Run `npx supabase start` to spin up the local supabase instance (requires Docker)

3. Run `npx supabase db reset` to get a clean database state

4. For development, at this point you must create a user with the email address `dev@snapconnect.com`

5. Then, run `./_scripts/seed-dev-data.sh`

This will give you the initial database state for development/testing

## APIs used

### Geocoding
- [OpenCage Data](https://opencagedata.com/guides/how-to-switch-from-nominatim)

### Weather
- [OpenMeteo](https://open-meteo.com/)

### Points of interest
- [TripAdvisor](https://tripadvisor-content-api.readme.io/reference/overview)

---

## References

### Nativewind

- [Installation](https://www.nativewind.dev/docs/getting-started/installation)
- for later: https://www.nativewind.dev/docs/getting-started/editor-setup

### Zustand

- [Introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Typescript guide](https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md)

### Jest

- [Unit testing Expo with Jest](https://docs.expo.dev/develop/unit-testing/)

### Supabase

- [Using Supabase with Expo](https://docs.expo.dev/guides/using-supabase/)
- [How to configure the Supabase MCP server (contains sensitive info)](https://supabase.com/docs/guides/getting-started/mcp)
- [Building User Auth with Expo and React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?utm_source=expo&utm_medium=referral&utm_term=expo-react-native&queryGroups=database-method&database-method=sql)

```bash
# produce a full dump of the db for backup, reset, or inspection
supabase db dump > schema.sql --local
```

## Building

- https://docs.expo.dev/build/setup/
- https://expo.dev/accounts/tslaton/projects/snapconnect/builds

## Server functions
- https://docs.expo.dev/router/reference/api-routes/


