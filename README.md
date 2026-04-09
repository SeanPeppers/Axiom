# 💠 Axiom

**A daily logic-puzzle terminal.**

Axiom is a daily, browser-based logic game where players must correctly configure network entities on a 4x4 grid. Built with a focus on a "cyber-terminal" aesthetic, players must satisfy a series of complex logical constraints to "compile" the system and prevent corruption.

## 🕹️ The Game

Every day, a new **Axiom** is generated with a unique scenario and set of constraints.

  * **Objective**: Place all four entities (**Data Node**, **Router**, **Firewall**, and **Virus**) into the correct 4x4 grid cells.
  * **Constraints**: Each entity has specific rules (e.g., "Firewall must be adjacent to Router," or "Virus must NOT occupy Row 1").
  * **Compiling**: Once all entities are placed, you hit **COMPILE**. You have **3 attempts** to find the valid configuration before the system is "corrupted".
  * **Difficulty**: Puzzles range from **BASIC** to **ADVANCED**, introducing conditional logic (IF/THEN) and stricter geometric requirements.

## 🚀 Tech Stack

  * **Framework**: [React 19](https://react.dev/).
  * **Build Tool**: [Vite](https://vitejs.dev/).
  * **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid drag-and-drop and UI transitions.
  * **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with a custom dark-mode "glassmorphism" theme.
  * **Icons**: [Lucide React](https://lucide.dev/).

## 🛠️ Development

### Prerequisites

  * Node.js (v20+ recommended)
  * npm or yarn

### Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/seanpeppers/axiom.git
    cd axiom
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Start the development server**:

    ```bash
    npm run dev
    ```

4.  **Build for production**:

    ```bash
    npm run build
    ```

## 🧠 Architecture

  * **Logic Engine (`src/engine/logicEngine.js`)**: A declarative evaluator that handles geometric rules (adjacency, orthogonal, same-row/col) and material implications for conditional rules.
  * **State Management (`src/hooks/useGameState.js`)**: Manages placement state, attempt history, and persistence to `localStorage` so you can resume your daily puzzle.
  * **Daily Rotation (`src/hooks/useDaily.js`)**: Uses a time-based epoch to ensure every user globally sees the same puzzle each day.

## 📄 License

This project is private and intended for personal use and portfolio demonstration. All rights reserved.
