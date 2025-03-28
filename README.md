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
├── frontend/              # React frontend application
│   ├── public/            # Static files
│   └── src/               # Source code
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── styles/        # CSS styles
│       └── App.js         # Main application component
├── backend/               # Flask backend application
│   ├── uploads/           # Directory for uploaded files
│   ├── output/            # Directory for output files
│   ├── logs/              # Application logs
│   ├── app.py             # Main application file
│   ├── data_processor.py  # Data processing module
│   └── optimization_service.py  # Optimization algorithms
└── README.md              # This file
```

## Technology Stack

### Frontend
- React.js
- Material-UI for components
- React Router for navigation
- Axios for API calls

### Backend
- Flask
- Pandas for data processing
- NumPy for numerical computations
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

## Usage

1. Navigate to the home page and click "Get Started"
2. Upload your inventory data CSV file
3. Review and edit your data if needed
4. Run the optimization algorithm
5. View the optimization results and recommendations
6. Export or download the results as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Operations Research algorithms for inventory optimization
- React and Flask communities for excellent documentation and support 