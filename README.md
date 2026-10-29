# ✈️ TripWise AI — Personalized Travel Itinerary Planner

**Plan smarter. Travel better. Explore more.**

TripWise AI is an AI-powered travel planning web application that helps users create personalized travel itineraries based on their destination, budget, travel dates, interests, and travel preferences.

The application simplifies travel planning by generating structured day-by-day itineraries with activity suggestions, dining recommendations, accommodation ideas, transportation guidance, and estimated travel expenses.

🌐 **Live Demo:** https://tripwise-ai-travel-p-3yua.bolt.host

---

## 📌 Project Overview

Planning a trip often requires researching multiple websites, comparing destinations, estimating expenses, and organizing daily activities.

TripWise AI aims to simplify this process through an intuitive interface and AI-powered itinerary generation.

Users can enter their travel preferences and receive a structured itinerary tailored to their needs, helping them save time and organize their travel plans more efficiently.

The platform is designed for solo travelers, couples, families, and groups looking for personalized travel recommendations.

## ✨ Key Features

- **AI-Powered Travel Planning:** Generate personalized travel itineraries based on user preferences.
- **Personalized Recommendations:** Tailor suggestions according to destination, interests, budget, and travel style.
- **Day-by-Day Itineraries:** Organize activities into a clear daily schedule.
- **Budget-Friendly Planning:** Include estimated expenses to help users plan within their budget.
- **Activity Recommendations:** Discover sightseeing opportunities, food experiences, cultural attractions, and outdoor activities.
- **Travel Assistance:** Receive accommodation and transportation suggestions.
- **User-Friendly Interface:** Navigate a modern, responsive travel-planning website.
- **Demo Mode:** Explore sample itineraries when live AI generation has not been configured.

*Note: Live AI generation requires the appropriate API configuration. Features such as authentication, persistent trip storage, and itinerary editing depend on the implemented application functionality.*

## 🛠️ Technology Stack

The project uses a modern web-development approach.

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe application development |
| Tailwind CSS | Responsive styling and UI design |
| Bolt | AI-assisted development environment |
| Bolt Database | Database and backend integration, where configured |
| Generative AI API | Personalized itinerary generation |

*Verify the actual project dependencies and configuration files before treating this table as a definitive inventory of the implementation.*

## ⚙️ How It Works

1. **Enter Travel Details:** Provide your destination, travel dates, number of travelers, and budget.
2. **Choose Preferences:** Select interests such as sightseeing, food, adventure, nature, or culture.
3. **Generate an Itinerary:** Request a personalized day-by-day travel plan.
4. **Review Recommendations:** Explore suggested activities, dining options, transportation, and estimated costs.
5. **Plan Your Trip:** Use the generated itinerary as a starting point for organizing your travel experience.

## 🚀 Getting Started

### Prerequisites

Before running the project locally, install:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/)

### 1. Clone the Repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/tripwise-ai.git
```

### 2. Navigate to the Project

```bash
cd tripwise-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Check the project's existing environment configuration and create a `.env` file only if required by the application.

For example, if the project uses Vite and the relevant frontend configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** These are examples only. Use the exact variable names required by your codebase. Do not add unused variables.

Never expose private API keys, database passwords, or privileged service-role keys in frontend environment variables.

### 5. Configure AI Generation

The current Bolt project indicates
