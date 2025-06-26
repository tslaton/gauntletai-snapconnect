https://gist.github.com/decagondev/2936b44b58ffb83a8191bc90fa7ae435

Use this prompt template to generate comprehensive Product Requirements Documents (PRDs) and associated task lists for your projects.

## Prompt Template

```
You are an experienced product manager and technical architect. Generate a complete Product Requirements Document (PRD.md) and associated task management files for the following project:

**PROJECT DETAILS:**
- Project Name: [INSERT PROJECT NAME]
- Project Description: [INSERT 2-3 SENTENCE DESCRIPTION]
- Target Users: [INSERT TARGET AUDIENCE]
- Key Features: [LIST 3-5 MAIN FEATURES]
- Database Choice: [Firestore OR MongoDB]

**TECHNICAL STACK REQUIREMENTS:**
- Frontend: Vite + React + TypeScript + Tailwind CSS 4 + Firebase Auth
- Backend: Express.js + CORS + OpenAI API + Firebase/Firestore
- Database: {Database Choice from above}
- Frontend Deployment: Netlify
- Backend Deployment: Render.com

**DEVELOPMENT PHILOSOPHY:**
Focus on getting a minimal viable skeleton deployed as early as possible in the development process. Prioritize deployment setup and basic functionality over feature completeness in initial phases.

**REQUIRED DELIVERABLES:**
Generate the following files with detailed, actionable content:

1. **PRD.md** - Complete Product Requirements Document
2. **TASKLIST.md** - Master task list from start to finish
3. **SETUP-TASKS.md** - Detailed setup and deployment tasks
4. **FE-TASKS.md** - Frontend-specific development tasks  
5. **BE-TASKS.md** - Backend-specific development tasks

**PRD.md STRUCTURE:**
- Executive Summary
- Project Overview
- User Stories & Requirements
- Technical Architecture
- API Specifications
- Database Schema
- UI/UX Requirements
- Deployment Strategy
- Success Metrics
- Timeline & Milestones
- Risk Assessment

**TASK LIST REQUIREMENTS:**
- Each task should be specific and actionable
- Include estimated time for completion
- Specify prerequisites and dependencies
- Include deployment checkpoints
- Provide detailed step-by-step instructions for setup tasks
- Assume the developer has basic knowledge but needs specific guidance for this stack

**DEPLOYMENT PRIORITY:**
Structure all tasks to achieve these milestones in order:
1. Basic project skeleton setup (frontend + backend)
2. Initial deployment to Netlify + Render (even if minimal)
3. Authentication integration
4. Database connection and basic CRUD
5. Core feature development
6. Iteration and enhancement

Make all instructions detailed enough that a developer familiar with the technologies can follow them without additional research. Include specific commands, configuration files, and deployment steps.
```

## How to Use This Template

1. **Fill in the PROJECT DETAILS section** with your specific project information
2. **Choose your database** (Firestore or MongoDB) 
3. **Copy the complete prompt** and paste it into your AI assistant
4. **Review and customize** the generated files for your specific needs

## Example Usage

Here's how you would fill out the template for a task management app:

```
**PROJECT DETAILS:**
- Project Name: TaskMaster Pro
- Project Description: A collaborative task management application that helps teams organize, prioritize, and track project tasks with real-time updates and AI-powered insights.
- Target Users: Small to medium-sized development teams and project managers
- Key Features: Task creation/editing, team collaboration, AI task prioritization, real-time notifications, progress tracking
- Database Choice: Firestore
```

## Benefits of This Approach

- **Consistency**: Every project follows the same structure and deployment pattern
- **Early Deployment**: Focus on getting something live quickly for validation
- **Detailed Guidance**: Setup tasks are specific enough for any developer to follow
- **Scalable**: Template works for projects of varying complexity
- **Complete Coverage**: Addresses all aspects from setup to deployment