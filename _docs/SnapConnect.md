# Mission

Provide itinerary suggestions, travel-blog type content creation, and social connection for travelers

# RAG-enabled value-adds

1. **Activity suggestions**

eg., "I want to see the coolest temples in Tokyo" -> RAG pulls in temples in Tokyo, Tripadvisor ratings -> suggests some

User adds these to their bag of things they want to do.

2. **Day planner**

eg., "help me plan my day" -> RAG pulls weather, user's "want to do" + fills in gaps with general trip preferences -> makes a plan for the day
 
3. **Itinerary planner**

eg., "make me an itinerary for a five-day trip to Tokyo" -> RAG takes planned days and general trip goals and combines them with 

4. **Highlight reels**

Collection of user photos uploaded during trip -> tell the story over time and place with choice photos

This can be personal or uploaded "blog" style

5. **Caption generation**

pull location from photo and context of trip -> generate a compelling caption

The system would retrieve data about the locations in your photos (history, fun facts, local significance), analyze your previous posts to understand your tone (e.g., witty, informative, adventurous), and generate a narrative with captions. For example, for a photo of pasta in Rome, it could retrieve the history of Cacio e Pepe and draft a caption like: *"Tasting history in every bite! Did you know Cacio e Pepe has been a Roman staple since the days of the shepherds? Simple, yet perfect."*

6. **Recommend user content related to trip**

Suggest user-posted "stories" that relate to the destination or activities within the destination

# Feature adds from MVP

- captions, markup on photos
- following users
- users can enter an "about" section for their profile page

# Non-goals

- ephemerality: deletion of content runs counter to learning from other user's shared experiences and 
- advanced AR and filters

# Extension for later (ignore for now)

- allow stories to be private
- include flights and accommodations planning
- more detailed user profiles
- help users meet other travelers going to the same location, relevant past experiences, or similar interests
- form group chats?
- map view?
