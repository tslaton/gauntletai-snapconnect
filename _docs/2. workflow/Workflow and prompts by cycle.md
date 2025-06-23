# Checklists

We are in the process of building the project described in [[PRD]].

We are doing this by going through the phases described in [[Phase plan]].

We are currently in `${stage X}` and have implemented the changes in `${checklist X}`.

Please create a new plan for implementing the missing elements of `${phase X}`.

Look around the repo and past checklists to understand the current project.

Then create a .md checklist with ~20 items that will allow us to make the most progress toward finishing the current phase. 

Keep the items simple and use at most 2 layers of hierarchy. Do not put in any code snippets. 

Put the checklist in `2. workflow/checklists`.

# Workflow

For each unchecked item in the checklist:
1. Read the item.
2. Gather context (PRD, checklists, relevant files)
3. Plan the edits.
4. Execute.
5. If backend-related, run a quick terminal test.
6. Mark the item complete & note decisions/bugs.
7. Repeat until the checklist is done.

# Debugging

We are currently in `${stage X}` and have recently implemented the changes in `${checklist X}`.

While implementing `${checklist item Y}>` we have encountered the following error/problem:

`${paste error message/description/logs}`

We have already tried fixing it with the following approaches:

`${Ask agent to describe what it already tried and why it didn't work}`

Please look at all the relevant context before proposing a plan how to fix this issue.

There is a high likelihood that part of the problem is that we have overcomplicated this. There is probably a very simple fix that may require taking a step back to find it.

Propose 3 approaches to fix the issue, and ask for any additional context, logs, or experiments that we can run to improve your guess.

Then choose the most likely reason for our problem and put it on top of your plan.

# Testing

We are currently in `${stage X}` and have recently implemented changes in `${checklist X}`.

I want to make sure everything works properly.

Please conduct a simple set of tests, either by creating a testing script or simply by testing API routes and backend features via your terminal.

I am looking for the simplest, most straightforward confirmation that everything works. We are building an MVP here, not Google core infrastructure.

Execute the tests right away, and report back to me with any issues.