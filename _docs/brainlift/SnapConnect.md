# Mission

Go beyond ice-breakers and events with low or anonymous attendance. Help people connect in real-life with people nearby who share their interests

# Core user persona

**user:** person living in an urban or suburban area with lots of events but no one to go with, needs help reaching activation energy

**job to be done:** give the user near-term, actionable event recommendations that meet their interests AND facilitate meeting like-minded people they could hold on to afterward

**pain points:** existing efforts in the space feel noisy or unfocused; general concerns about meeting strangers and sharing details or location info

**tech comfort:** likely young-ish and familiar with smartphones and social apps

# Customer insights


# Spiky POVs

- AR, filters, etc. in Snapchat make it feel more like a gimmick or time-waster than something useful
- facilitating real-world meet ups > sustained online relationships
- people don't want to just go to a concert, they want to go _with someone_
- people are actually more likely to attend something spontaeneous, _if it's highly correlated to their interests_

# MVP (created before this document)

- searching for, requesting, and matching with friends; optional usernames replace real names
- messaging
- taking sending photos

# User-niche features

1. Sign up flow where users can pick a limited number of priority interests. Perhaps one list of "what I want to do most with others" and one list of "what I spend my time doing most". I think a brief free-form (<= 500 words) profile option is a good idea, too, as an escape hatch. Since we have RAG, we will be able to understand and quickly surface relevant user profiles based on one user's "seeking" query. At the same time, we don't want too much profile material, because I believe users can get turned away or won't fill it out.

	- cap interests at 3-5
	- Myers-Briggs, Enneagram, etc.?
	- have AI suggest refinement/more detail (eg., "I like to read" -> "My favorite books are a, b, c. Most recently I've read...")

2. Import data from somewhere like EventBrite. Possibly transform it into our ownbedata structure so that when we supporting combinging with other data sources or constructing our own events directly on Snapconnect. 

	- start with a custom format and minimal set of fields:
		- event title
		- start and end time
		- location
		- description
		- interest tags or activity tags
	- these data can be seeded; RAG can generate this format from various sources

3. Events view -> Event details page. A list of all of the events that is searchable or filterable by a RAG-backed user query. It leads to a screen with logistical details and the option to join the Event.
	
	- favor natural language queries, powered by RAG
	- simple UX > many visible filters

4. Maps view. This shows the events oriented in terms of location. Tapping one should display a brief details card (including statistics about the other people attending and their interest-based match scores with the user). Long-pressing the details card should open the full Event details page. It is possible this page and (3) are redundant. If we provide a search by RAG-backed user query on the Map, it could be sufficient on its own without a simple text-based event list. But it could be nice to have options.  

5. Each event will need a channel or set of channels (chat rooms) where users can chat and send photos (later, video).

	- these help users meet and keep memories of events or stay in touch, but remember... the thesis is users should meet in the real world
	- refinement: instead of a single giant event chat, break it down by interests or personality types

6. At the end of an event, we should generate a nice highlights reel, probably personalized to the user based on content referencing them or their friends and deliver it to each user who attended the event.

	- this is about Memories, akin to Apple Photos

7. A dedicated Profile tab, where the user can edit their interests, free-form blurb, and post any key photos/videos.

	- keep it focused: small number of pinned items, interests, etc.
	- update it automatically overtime based on event attendance (probably not shipping in Gauntlet timeline though)

8. A Matches tab, where the user can see nearby users who opt-in that best match their interests. Should make it easy to invite these users to events.

	- can factor in event attendance history, too
	- do we do general matches? (eg., looking for your soulmate, anywhere?) 
		-> seems like something for later, not a core focus

# Privacy and Trust

- location-sharing, messaging, and group participation must be opt-in
- should profiles be opt-in?
- is it fair to say, you surrender some of these concerns to participate when you willingly install the app and continue to use it?

# Non-goals

- advanced AR and filters
