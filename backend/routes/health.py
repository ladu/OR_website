import logging
from flask import Blueprint, jsonify

# Configure logger
logger = logging.getLogger('inventory_optimizer_health')

# Create blueprint
health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for the API"""
    logger.info("Health check endpoint called")
    return jsonify({"status": "healthy", "version": "1.0.0"}) 