# Fake or Not? - Advanced Trust Analyzer

![Fake or Not? Logo](https://northgatelogistics.pl/wp-content/uploads/2023/01/NGLT-kolko-BIALEsrodek.png)

"Fake or Not?" is a sophisticated web application designed to help users, particularly within the logistics sector, verify the authenticity and trustworthiness of emails and domains. Developed for North Gate Logistics, it serves as a first line of defense against phishing, typosquatting, and other forms of digital fraud common in the industry.

The application leverages the power of generative AI to analyze various technical data points and provide a clear, actionable recommendation—"Fake" or "Real"—along with a detailed breakdown of the findings.

## Table of Contents
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Project Structure](#project-structure)
- [Core Functionality Explained](#core-functionality-explained)
  - [Trust Analysis Flow](#trust-analysis-flow)
  - [AI-Powered Chat](#ai-powered-chat)

## Key Features

- **Unified Input Analysis**: Accepts either an email address or a domain name for analysis.
- **AI-Powered Summary**: Utilizes Genkit with Google's Gemini models to process complex data (WHOIS, DNS records, etc.) and generate a simple, human-readable summary, confidence score, and a final "Fake" or "Real" verdict.
- **Interactive Results Chat**: Users can ask follow-up questions about the analysis in a natural language chat interface, allowing for deeper investigation of the results.
- **Detailed Data Breakdown**: Presents all underlying analysis data in an organized, expandable accordion format, covering:
  - Domain Reputation & Typosquatting Check
  - WHOIS Information & DNS Records (SPF, DKIM, DMARC)
  - Blacklist Status & Threat Intelligence Reports
  - Historical Data & Email Verification
- **Informational Pages**:
  - **Jak to działa? (How it works?)**: A multi-section page that explains the app's three-step analysis process and includes the comprehensive carrier verification manual for company employees.
  - **Przykłady fałszerstw (Forgery Examples)**: A gallery of common email and domain forgery techniques to educate users.

## Technology Stack

This project is built with a modern, robust, and type-safe technology stack.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN](https://ui.shadcn.com/)
- **Generative AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Deployment**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project_directory>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables. Create a `.env` file in the root directory and add your Google AI API key:
   ```env
   GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```

### Running the Development Server

The application uses two development servers: one for the Next.js frontend and one for the Genkit AI flows.

- **To run the Next.js dev server:**
  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:9002`.

- **To run the Genkit dev server:**
  ```bash
-  npm run genkit:dev
-  ```
- The Genkit developer UI will be available at `http://localhost:4000`.

## Project Structure

The codebase is organized to separate concerns, making it modular and maintainable.

```
/
├── src/
│   ├── app/                # Next.js App Router: Pages, layouts, and server actions.
│   │   ├── (page-routes)/
│   │   │   └── page.tsx      # Entry point for each route.
│   │   ├── actions.ts      # Next.js server actions.
│   │   ├── globals.css     # Global styles and CSS variable definitions.
│   │   └── layout.tsx        # Root layout for the application.
│   │
│   ├── ai/                 # All Genkit-related code.
│   │   ├── flows/          # Genkit flows for specific AI tasks.
│   │   └── genkit.ts       # Genkit initialization and configuration.
│   │
│   ├── components/         # Reusable React components.
│   │   ├── ui/             # ShadCN UI components (Button, Card, etc.).
│   │   └── *.tsx           # Custom application-specific components.
│   │
│   ├── hooks/              # Custom React hooks.
│   │
│   └── lib/                # Shared utilities, types, and mock data.
│       ├── mocks.ts        # Mock data generation for offline development.
│       ├── types.ts        # Shared TypeScript type definitions.
│       └── utils.ts        # Utility functions (e.g., `cn` for classnames).
│
├── public/                 # Static assets (images, fonts).
├── next.config.ts          # Next.js configuration file.
└── tailwind.config.ts      # Tailwind CSS configuration file.

```

## Core Functionality Explained

### Trust Analysis Flow

1.  **User Input**: A user enters an email or domain into the `TrustCheckForm`.
2.  **Server Action**: The form submission triggers the `performTrustCheck` server action in `src/app/actions.ts`.
3.  **Mock Data Generation**: For this demonstration, `getMockAnalysisResults` (`src/lib/mocks.ts`) generates deterministic, fake analysis data based on the input query. In a production scenario, this step would be replaced with calls to real-world analysis APIs.
4.  **AI Summarization**: The mock data is passed to the `summarizeTrustCheckResults` Genkit flow (`src/ai/flows/summarize-trust-check-results.ts`). The AI model analyzes the data and returns a structured JSON object containing the summary, recommendation, and confidence score.
5.  **Display Results**: The combined analysis data and AI summary are passed back to the client and rendered in the `TrustCheckResults` component.

### AI-Powered Chat

1.  **System Prompt**: When the results are displayed, the `TrustCheckChat` component is initialized with a detailed system prompt. This prompt provides the AI with the full analysis report and instructs it to only answer questions based on that data.
2.  **User Question**: The user types a question into the chat input.
3.  **Chat Action**: The `chatAboutResults` server action is called, which in turn invokes the `chatWithResults` Genkit flow.
4.  **Conversation History**: The flow sends the entire conversation history (including the system prompt) to the AI model, which generates a context-aware response.
5.  **Display Reply**: The AI's reply is streamed back to the UI and displayed in the chat window.
