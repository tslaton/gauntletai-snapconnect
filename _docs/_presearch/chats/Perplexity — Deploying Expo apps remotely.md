https://www.perplexity.ai/search/how-would-i-get-a-link-to-my-e-e_dUVgLxRFCP4hSnuU.k4g

## Getting a Link to Your Expo App and Deploying It Remotely

To share and deploy your Expo app remotely, you have a few options depending on your target platform (mobile or web) and your workflow (development or production). Here’s a step-by-step guide to both scenarios:

---

**For Mobile Apps (Expo Go and EAS Update):**

If you want to share your Expo app for testing or demonstration—without publishing to the App Store or Google Play—you can use Expo Go and EAS Update:

1. **Login to Expo/EAS:**
   ```bash
   eas login
   ```
2. **Configure Your Project:**
   Set up your project for EAS builds and updates:
   ```bash
   eas build:configure
   ```
3. **Publish and Get a Shareable Link:**
   Deploy your app and generate a public link and QR code:
   ```bash
   eas update
   ```
   After running this command, Expo will provide a link (such as `https://expo.dev/@your-username/your-app`) and a QR code. Anyone with the Expo Go app can scan the code or open the link to run your app on their device[1].

---

**For Web Apps (Expo Web and EAS Hosting):**

If you want to deploy your Expo app as a web app and share a URL:

1. **Export Your Web App:**
   ```bash
   npx expo export --platform web
   ```
   This creates a `dist` directory containing your static web app[2].

2. **Deploy to EAS Hosting:**
   ```bash
   eas deploy
   ```
   You’ll be prompted to choose a preview subdomain. After deployment, Expo will provide you with a URL like:
   ```
   https://your-app--uniqueid.expo.app/   (preview)
   https://your-app.expo.app/             (production)
   ```
   You can share this link with anyone, and they’ll be able to access your app in the browser[2].

   - Alternatively, you can deploy the `web-build` or `dist` directory to services like Netlify or Vercel for a public web link[3].

---

**Deep Linking and Custom Schemes:**

If you want to create custom links that open your app to specific screens (deep linking):

- Add a custom scheme in your `app.json`:
  ```json
  {
    "expo": {
      "scheme": "myapp"
    }
  }
  ```
- After building, you can use links like `myapp://somepath/details` to open your app to a specific route[4][5].
- For development, you can use the `exp://` URL shown in your terminal when you run `expo start`—this opens your app in Expo Go and can be used for OAuth redirects and testing[6].

---

## Summary Table

| Use Case                        | Command(s) / Method                  | Link Type/Result                              |
|----------------------------------|--------------------------------------|-----------------------------------------------|
| Share mobile app via Expo Go     | `eas update`                         | Expo Go link + QR code                        |
| Deploy as web app (Expo Hosting) | `npx expo export --platform web`<br>`eas deploy` | Hosted URL (e.g., `https://your-app.expo.app/`) |
| Custom deep links                | Add `scheme` to `app.json`           | `myapp://route` or `exp://` for development   |

---

**In summary:**  
- For mobile, use `eas update` to get a shareable Expo Go link[1].  
- For web, export and deploy with `eas deploy` to get a public URL[2].  
- For deep linking, configure your app’s scheme and use the generated URLs[4][5].

Sources
[1] How to publish expo app that can be accessed by anyone ... https://stackoverflow.com/questions/71475951/how-to-publish-expo-app-that-can-be-accessed-by-anyone-anywhere-using-qr-code
[2] Deploy your first Expo Router and React app https://docs.expo.dev/eas/hosting/get-started/
[3] Create and Deploy Web Apps and PWAs with Expo 🕸 https://blog.expo.dev/create-and-deploy-web-apps-and-pwas-with-expo-a286cc35d83c?gi=b9d81bee7db4
[4] Linking into your app - Expo Documentation https://docs.expo.dev/linking/into-your-app/
[5] Overview of Linking, Deep Links, Android App Links, and iOS ... https://docs.expo.dev/linking/overview/
[6] How to Use Custom Deep Links in a React Native Expo App https://mattermost.com/blog/custom-deep-links-for-react-native-apps/
[7] Host your Expo app anywhere. Export your JS bundle and assets so… https://blog.expo.dev/host-your-expo-app-anywhere-dedf9724de7
[8] How to get link to redirect to expo app during development https://stackoverflow.com/questions/58548822/how-to-get-link-to-redirect-to-expo-app-during-development
[9] How to Universal link to app : r/expo - Reddit https://www.reddit.com/r/expo/comments/169nq0j/how_to_universal_link_to_app/
[10] How do I make an expo app viewable by other people? - Reddit https://www.reddit.com/r/reactnative/comments/thmng3/how_do_i_make_an_expo_app_viewable_by_other_people/
[11] Expo Documentation https://docs.expo.dev
[12] How to Deploy Your React Native Expo App to the App Store https://www.youtube.com/watch?v=qzTZt6mYFF4
[13] Trying to open a link from my expo app using react-native Linking https://stackoverflow.com/questions/78065407/trying-to-open-a-link-from-my-expo-app-using-react-native-linking
[14] How to set up iOS Universal Links and Android App Links with Expo ... https://www.youtube.com/watch?v=kNbEEYlFIPs
[15] Android App Links https://docs.expo.dev/linking/android-app-links/
[16] Linking into other apps https://docs.expo.dev/linking/into-other-apps/
[17] Building expo app remotely? - Reddit https://www.reddit.com/r/expo/comments/1gfp1n4/building_expo_app_remotely/
[18] Publish websites - Expo Documentation https://docs.expo.dev/guides/publishing-websites/
[19] Deploy an Expo app to production - Clerk https://clerk.com/docs/deployments/deploy-expo
[20] GitHub - draftbit/exp-deploy-cli: 🖥 🗜 Deploy Expo apps to different environments (staging, production) https://github.com/draftbit/exp-deploy-cli/
