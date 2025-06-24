We will feed this info to: [Magic Path](https://www.magicpath.ai/)

We already have a sign up/login flow. This document describes what an authenticated user will see. 

We are building a mobile app like a barebones Snapchat. We are starting by building an MVP with minimal core features in a constrained time, so we should not do anything extraneous. Focus on the features described in this document. We should have the following tabs at the bottom:

1. `Chat`
2. `Camera`
3. `Stories`

Tapping the `Chat` tab should open the `Chat View`, tapping the `Camera` tab should display the `Live Camera View`, and tapping the `Stories` tab should display the `Stories View`. We can worry about the details of the `Chat View` and `Stories View` later—for now, they should just display their names.

The `Camera` tab should be active by default when we log in, showing the `Live Camera View`. This screen should display an active camera in the main area above the bottom tabs.

~~Like Snapchat, we should display some filters and effects next to the shutter button. Let's start with just one effect/filter to the right of the shutter button. A simple retouch/smoothing filter is a good start. Just show the icon to start with, but don't connect it to any functionality other than logging that it was pressed. We will worry about the functionality later.~~

In the top left corner, we should have a user account button that opens the user's profile settings. It should display the user's avatar, or a placeholder if the avatar is not set.

In the top right corner, we should have a button that swaps which camera we are using (ie, front or back camera). 

~~Define the concept of "Story" to be a carousel of images we have sent that our friends can see. Don't worry about implementing the details of the `Story View` for now.~~

When the shutter button is pressed, we should display the `Compose View`. Here the captured image should display where before there was a live camera view. We should get the option to tap to add text in a central overlay. At the bottom, we should have buttons (`Story`) to add the captured photo to our story or to `Send` the photo. At the top left we should have a button that dismisses the `Compose View` and returns to the `Live Camera View`. 

If we tap the `Story` button, we should return to the `Live Camera View` and display a brief "posted!" banner (~3 seconds) at the top of it. Don't worry about any other details of what a Story does for now.

~~On the righthand side there should be a way to apply the same retouch/smoothing filter we had on the live preview screen. It should call the same function as before that for now just logs that it was pressed.~~

If we click the `Send` button, it should bring up a view (the `Send View`) where we can see and search through all of our contacts. The contacts list (displaying their names) should take up the majority of the screen at the bottom. At the top, we should have a search bar, with a button to dismiss this view and go back to the `Compose View`.

From the `Send View`, if we tap a contact, it should send the the composed image (with any applied text) to that contact and open the `Chat View` (the same one that opens if we press the `Chat` tab, initially). 

In the `Chat View`, we should see a list of all of the `conversations` we have started (ie, the contacts we have messaged, or those who have messaged us). Above the conversations, at the top of the view we should have filters for and All, Unread. The active one (All by default) should have a faint rounded blue background applied to it. If we tap a conversation, it should load the `Messaging View` for that `conversation`. Each `conversation` should be named according to the contact or contacts involved.

In the `Messaging View`, we should see a stream of all of the text messages and images we have exchanged in that conversation on top, with a text box to compose a next text message, as well as the keyboard, at the bottom. The text and images should be ordered by ascending timestamp and left- or right-aligned to indicate whether the sender was someone else in the conversation (left-aligned) or you (right-aligned). indicating the sender. At the top of the `Messaging View`, we should see the name of the `conversion` (eg., the person or group it is with).

Now, thinking about the main tabs at the bottom, if we tap the `Chat` tab, it should display the `Conversations View` we mentioned earlier.