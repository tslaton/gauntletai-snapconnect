# Overview

I am developing a feature that helps users plan itineraries.

An `activity` has properties like:

- a title (text)
- a description (text)
- a location (text)
- a start_time (timestamp)
- an end_time (timestap)
- an image_url (text)
- tags (text[])
- created_by (uuid, foreign key to user profiles)
- created_at (timestamp)
- updated_at (timestap)

An `itinerary` is a collection of multiple activities. It is also owned by a user (`created_by`). It also has a JSON array "weather" that can be empty. This will be used to store information about the weather for each day in the itinerary.

# Requirements

## Data

- Generate the SQL to produce the corresponding tables/schemas supporting these features
- Add to `seed.sql` reasonable seed data representing some itineraries and activities for some trips to foreign countries to help us as we develop the UI

## Itineraries tab

- Users must be able to view their itineraries on an "Itineraries" tab with a suitable icon
- Itineraries must be presented as cards with a nice cover, their title, their start time, their end time, and their tags
- Users must be able to search their itineraries with a simple text query
- Users must be able to initiate creation of new itineraries, eg. a button in the top right like `+ New` in `Chats` that brings up a New Itinerary modal
  - users must be able to assign a title (required)
  - users must be able to assign a description (optional)
  - users must be able to specify a start_time and end_time (optional)
  - users must be able to customize a cover image (reference or reuse UserAvatar) (optional)
- From any given itinerary in this list, users must be able to navigate to a page (eg., slides in from the right) where the can view the Itinerary Details

## Itinerary details

- Users must be able to view a list of all of the activities
- This activity list should be sorted in chronological order and broken down into subsections for each Day the activities occur on (compute this on the client from their start and end times)
- Activities without a time should get rendered in a special section at the bottom "Not scheduled"
- Users must be able to create new Activities (eg., with a button in the top right following our `+ New` convention)
- When creating a new activity:
  - users must be able to assign a title (required)
  - users must be able to assign a description (optional)
  - users must be able to specify a start_time and end_time (optional)
  - users must be able to customize a cover image (reference or reuse UserAvatar) (optional)
  - users must be able to specify tags (; separated text) (optional)
- Users must be able to edit an existing activity by tapping it
  - this should bring up an activity editing modal similar to the activity creation modal... try to reuse code
