# BudgetBuddy

BudgetBuddy is a comprehensive personal finance management application designed to help users track expenses, manage budgets, gain insights into their spending habits through AI-powered predictions, and interact with a helpful chatbot. It features a modern user interface with light/dark themes and multi-language support.

## Key Features

- **User Authentication:** Secure user registration and login.
- **Expense Tracking:** Add, edit, delete, and view expenses with details like amount, category, date, and optional receipts.
- **Category Management:** Create, edit, and delete custom expense categories.
- **Budget Management:** (Partially Implemented) Functionality to create and manage budgets.
- **Dashboard:** Overview of financial activity, including recent transactions and potentially summaries.
- **User Profile Management:** Update email, password, profile picture, and currency preferences.
- **AI-Powered Predictions & Insights:**
  - **Spending Forecast:** Predicts future spending patterns.
  - **Anomaly Detection:** Identifies unusual spending activities.
  - **Budget Optimization:** (Planned/Conceptual) Suggestions for optimizing budgets.
  - **Behavioral Nudges:** (Planned/Conceptual) Tips to encourage better financial habits.
  - **Benchmarking:** (Planned/Conceptual) Compare spending with anonymized user data.
- **Interactive Chatbot:** Provides assistance and answers questions related to finances (UI implemented, backend integration in progress).
- **Internationalization (i18n):** Supports multiple languages (English and French).
- **Theme Customization:** Light and Dark mode support.
- **Responsive Design:** User interface adapts to different screen sizes.
- **File Uploads:** Upload receipts for expenses and profile pictures.

## Tech Stack

### Frontend

- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Charting:** Chart.js with react-chartjs-2
- **Styling:** CSS (custom styles in `styles.css`), Tailwind CSS (setup, usage may vary)
- **Linting:** ESLint
- **UI Components:** Lucide React (for icons)
- **Context API:** For state management (Auth, Theme, Language)

### Backend

- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs for password hashing
- **File Handling:** Multer for file uploads
- **Middleware:** CORS, error handling, authentication protection
- **Environment Variables:** dotenv

### AI/ML (Python Backend)

- **Libraries:**
  - Prophet (for time series forecasting)
  - Pandas, NumPy (for data manipulation)
  - Scikit-learn (for machine learning tasks)
  - Transformers, Torch (for NLP/Chatbot - planned integration)
- **Execution:** Python scripts executed from the Node.js backend.

## Project Structure

```
BudgetBuddy/
├── backend/                  # Node.js/Express backend
│   ├── ai_models/            # Python scripts for AI features
│   ├── controllers/          # Request handlers
│   ├── middlewares/          # Custom Express middlewares
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── uploads/              # User uploaded files (profile pics, receipts)
│   ├── utils/                # Utility scripts (e.g., pythonExecutor)
│   ├── package.json
│   └── server.js             # Main backend server file
│
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React Context API providers
│   │   ├── pages/            # Page-level components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css        # Global and component styles
│   ├── package.json
│   └── vite.config.js        # Vite configuration
│
└── README.md                 # This file
```

## Prerequisites

- **Node.js:** Version 18.x or higher (includes npm).
- **MongoDB:** Ensure you have a running MongoDB instance (local or cloud-based like MongoDB Atlas).
- **Python:** Version 3.8 or higher (for AI scripts).
- **pip:** Python package installer.

## Setup & Installation

1. **Clone the Repository:**

   ```powershell
   git clone <repository-url>
   cd BudgetBuddy
   ```

2. **Backend Setup:**

   - Navigate to the backend directory:

     ```powershell
     cd backend
     ```

   - Install Node.js dependencies:

     ```powershell
     npm install
     ```

   - Create a `.env` file in the `backend` directory and add the following environment variables (replace placeholders with your actual values):

     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     # Optional: Add any other environment variables your backend might need
     ```

   - Install Python dependencies for AI models:
     Navigate to the `ai_models` directory:

     ```powershell
     cd ai_models
     ```

     Install the required Python packages:

     ```powershell
     pip install -r requirements.txt
     ```

     Return to the `backend` directory:

     ```powershell
     cd ..
     ```

3. **Frontend Setup:**

   - Navigate to the frontend directory from the project root:

     ```powershell
     cd ../frontend
     ```

   - Install Node.js dependencies:

     ```powershell
     npm install
     ```

## Running the Application

1. **Start the Backend Server:**

   - Navigate to the `backend` directory:

     ```powershell
     cd backend  # (If not already there)
     ```

   - Start the server (usually with a script defined in `backend/package.json`, e.g., `npm start` or `node server.js`. Assuming `node server.js` for now as no start script is defined in the provided `backend/package.json`):

     ```powershell
     node server.js
     ```

     The backend server should typically run on `http://localhost:5000` (or the port specified in your `.env`).

2. **Start the Frontend Development Server:**

   - Navigate to the `frontend` directory:

     ```powershell
     cd ../frontend # (If in backend) or cd frontend (If in root)
     ```

   - Start the Vite development server:

     ```powershell
     npm run dev
     ```

     The frontend application will usually be accessible at `http://localhost:5173` (Vite's default) or another port if specified. The `vite.config.js` includes a proxy to `http://localhost:5000` for API requests.

## AI Features Overview

The application leverages Python scripts for its AI capabilities, executed by the Node.js backend:

- **`spending_forecast.py`:** Uses the Prophet library to predict future user expenses based on historical data.
- **Other AI scripts (Anomaly Detection, etc.):** Located in `backend/ai_models/`, these scripts perform various analyses like identifying spending anomalies. The backend controllers in `backend/controllers/predictionController.js` handle requests, invoke these Python scripts, and process their output.

## Contributing

Contributions are welcome! Please follow standard Git practices: fork the repository, create a feature branch, make your changes, and submit a pull request.

## License

This project is not licensed under any official terms.
