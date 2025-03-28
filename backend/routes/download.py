import os
import logging
from flask import Blueprint, jsonify, send_file, current_app

# Configure logger
logger = logging.getLogger('inventory_optimizer_download')

# Create blueprint
download_bp = Blueprint('download', __name__)

@download_bp.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Send requested optimization result file to the client"""
    logger.info(f"Download request for file: {filename}")
    try:
        file_path = os.path.join(current_app.config['OUTPUT_FOLDER'], filename)
        logger.debug(f"Sending file: {file_path}")
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 404 