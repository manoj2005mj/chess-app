# Chess Application

A React-based chess game with two modes: Play against a friend or against an AI using Google's GenAI.

## Features
- 🎮 Two game modes: Player vs Player & Player vs AI
- ♟️ Classic chess rules implementation
- 🔑 API key integration for Google GenAI
- 📜 Move history tracking
- 🎨 Responsive UI with Tailwind CSS
- ⚖️ Check/Checkmate detection

## Prerequisites
- Node.js (v16.x or higher)
- npm (v8.x or higher) or Yarn
- Google GenAI API key (for AI mode)

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/your-username/chess-app.git
    cd chess-app
    ```

2. **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables**
    Create a `.env` file in the root directory:

    ```env
    REACT_APP_GOOGLE_API_KEY=your_api_key_here
    ```

## Running the Application

1. **Navigate to the `chess` directory** (if you're not already there):
    ```bash
    cd chess
    ```

2. **Start the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

## Deployment

To build for production:

```bash
npm run build
# or
yarn build
