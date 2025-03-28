import os
import logging
from flask import Blueprint, request, jsonify, current_app
import polars as pl
from werkzeug.utils import secure_filename
import json

# Import utilities
from utils.data_processor import process_csv

# Configure logger
logger = logging.getLogger('inventory_optimizer_upload')

# Create blueprint
upload_bp = Blueprint('upload', __name__)

def allowed_file(filename):
    """Check if the file extension is allowed"""
    ALLOWED_EXTENSIONS = {'csv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_json_serializable(df_dict):
    """Convert Polars Series objects to Python native types for JSON serialization"""
    result = {}
    for key, series in df_dict.items():
        if hasattr(series, 'to_list'):  # Check if it's a Series-like object
            result[key] = series.to_list()
        else:
            result[key] = series
    return result

@upload_bp.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle file uploads, convert CSVs to Parquet, and return file info"""
    logger.info("File upload endpoint called")
    
    if 'files' not in request.files:
        logger.warning("No files part in the request")
        return jsonify({"error": "No files part in the request"}), 400
    
    files = request.files.getlist('files')
    logger.info(f"Number of files received: {len(files)}")
    
    if not files or files[0].filename == '':
        logger.warning("No files selected")
        return jsonify({"error": "No files selected"}), 400
    
    uploaded_files = []
    
    for file in files:
        logger.info(f"Processing file: {file.filename}")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            logger.debug(f"Saving file to: {file_path}")
            file.save(file_path)
            
            # Process CSV to Parquet for efficient handling
            logger.info(f"Converting CSV to Parquet: {file_path}")
            try:
                parquet_path = process_csv(file_path)
                logger.info(f"Parquet file created: {parquet_path}")
                
                # Read sample of the data for frontend preview
                logger.debug("Reading sample data from parquet")
                df = pl.read_parquet(parquet_path).slice(0, 10)
                logger.debug(f"Preview data columns: {df.columns}")
                logger.debug(f"Preview data shape: {df.shape}")
                
                # Convert to JSON serializable format
                preview_data = convert_to_json_serializable(df.to_dict())
                
                file_info = {
                    "name": filename,
                    "original_path": file_path,
                    "parquet_path": parquet_path,
                    "columns": df.columns,
                    "preview": preview_data
                }
                logger.debug(f"File info prepared: {filename}, columns: {df.columns}")
                uploaded_files.append(file_info)
            except Exception as e:
                logger.error(f"Error processing CSV file {filename}: {str(e)}", exc_info=True)
                return jsonify({"error": f"Error processing file {filename}: {str(e)}"}), 500
        else:
            logger.warning(f"Invalid file format: {file.filename}")
            return jsonify({"error": f"Invalid file format: {file.filename}"}), 400
    
    logger.info(f"Successfully uploaded {len(uploaded_files)} files")
    return jsonify({
        "message": f"Successfully uploaded {len(uploaded_files)} files",
        "files": uploaded_files
    }) 