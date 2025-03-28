import os
import logging
from flask import Flask
from flask_cors import CORS

# Import route registration function
from routes import register_routes

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('inventory_optimizer_app')

# Create the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure file upload settings
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
ALLOWED_EXTENSIONS = {'csv'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload

logger.info(f"Upload folder: {UPLOAD_FOLDER}")
logger.info(f"Output folder: {OUTPUT_FOLDER}")

# Register all route blueprints
register_routes(app)

if __name__ == '__main__':
    logger.info("Starting Flask application on port 5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 