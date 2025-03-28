# Inventory Optimization Application

A web application for inventory optimization and management, built with React frontend and Flask backend.

## Features

- Upload inventory data in CSV format
- Visualize and manage inventory data
- Run optimization algorithms to determine optimal stock levels
- View detailed optimization results and recommendations
- Export results to CSV for further analysis

## Project Structure

```
.
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   └── src/                 # Source code
│       ├── components/      # React components
│       │   ├── inventory/   # Inventory-specific components
│       │   └── layout/      # Layout components (Navbar, Footer)
│       ├── pages/           # Page components
│       ├── assets/          # Images and static assets
│       ├── utils/           # Utility functions
│       ├── index.js         # Application entry point
│       └── App.js           # Main application component
├── backend/                 # Flask backend application
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── uploads/             # Directory for uploaded files
│   ├── output/              # Directory for output files
│   ├── logs/                # Application logs
│   ├── app.py               # Main application file
│   ├── requirements.txt     # Python dependencies
│   └── venv/                # Python virtual environment
├── .gitignore               # Git ignore file
├── LICENSE                  # MIT License
└── README.md                # This file
```

## Application Flow

1. **Inventory Optimization Hub** - Central hub for all inventory operations
2. **Data Upload** - Upload CSV files with schema validation
3. **Data Management** - View and manage uploaded inventory data
4. **Optimization Results** - View optimization results with detailed metrics

## Technology Stack

### Frontend
- React.js
- Material-UI for components
- React Router for navigation
- Axios for API calls
- localStorage for demo data persistence

### Backend
- Flask
- Polars for data processing
- NumPy for numerical computations
- Flask-CORS for cross-origin resource sharing
- Parquet for efficient data storage

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The application will be available at `http://localhost:3000`

## API Routes

The backend provides several API endpoints:
- `POST /api/upload` - Upload inventory data files
- `GET /api/files` - List uploaded files
- `POST /api/optimize` - Run optimization algorithms on uploaded data
- `GET /api/download/:filename` - Download output files

## Demo Mode

The application includes a demo mode that functions without a running backend:

1. Front-end automatically detects if backend is unavailable
2. Uses simulated data stored in localStorage
3. Provides a full end-to-end experience with dummy data

## CSV File Format

The application expects CSV files with the following columns:
- `product_id`: Unique identifier for each product
- `name`: Product name
- `current_stock`: Current inventory level
- `unit_cost`: Cost per unit
- `lead_time_days`: Number of days to receive an order
- `daily_demand`: Average daily demand for the product

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Operations Research algorithms for inventory optimization
- React and Flask communities for excellent documentation and support 