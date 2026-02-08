# Part 1: System Overview & Architecture

Welcome to the first part of our tutorial series on building a robust **Maker-Checker Workflow System**! 🚀

In this series, we'll dive deep into a modern, full-stack application that leverages microfrontends, a powerful backend factory pattern, and automated infrastructure.

## What is a Maker-Checker Workflow?

The **Maker-Checker** (or Four-Eyes) principle is a security and compliance pattern where a sensitive action must be performed by one person (the "Maker") and reviewed/approved by another (the "Checker").

Common use cases include:
- Banking transactions
- Content moderation
- User account approvals
- Configuration changes in production

## Our System Architecture

Our system is designed for scalability and extensibility. Here's a high-level look at the components:

### 1. The Backend (The Brain)
Built with **Hono** and **Node.js**, our backend is fast and type-safe. It uses **Drizzle ORM** for database interactions with PostgreSQL. The core logic follows a **Factory Pattern**, allowing us to add new types of actions (like "Create User" or "Update Account") without modifying the core workflow engine.

### 2. Microfrontends (The Face)
We use a **Microfrontend (MFE)** architecture powered by **Vite** and **Module Federation**. This allows different teams to develop and deploy specific components (like the "User App" or "Promotion App") independently.

- **Host App**: The central orchestrator that provides the shell, navigation, and authentication.
- **Sub-Apps**: Specialized apps that provide forms for "Making" an action and views for "Checking" it.

### 3. The Workflow Factory
This is where the magic happens! We have a **Workflow Factory** on both the backend and frontend:
- **Backend Factory**: Dynamically selects the right handler to execute an action upon approval.
- **Frontend Factory**: Dynamically loads the correct Microfrontend component (Create Form or Detail View) based on the action type.

### 4. Infrastructure & DevOps
The entire system is containerized with **Docker** and orchestrated using **Kubernetes (K8s)**.
- **Database**: Automated migrations with Drizzle.
- **Persistence**: Persistent Volume Claims (PVC) ensure data lasts across restarts.
- **Secrets**: Secure management of connection strings and keys.

## What's Next?

1. Backend Implementation with Hono [View Backend Implementation](implement-backend.md)
2. Implement micro-frontend with RsBuild, React and Module Federation [View Frontend Implementation](implement-frontend.md)
3. Deployment Applications with Kubernetes [View Kubernetes](kubernetes-deployment.md)

Stay tuned! ✌️