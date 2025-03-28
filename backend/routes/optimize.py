import os
import logging
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app

# Import services
from services.optimization_service import optimize_inventory
from utils.data_processor import format_output

# Configure logger
logger = logging.getLogger('inventory_optimizer_optimize')

# Create blueprint
optimize_bp = Blueprint('optimize', __name__)

def convert_to_json_serializable(df_dict):
    """Convert Polars Series objects to Python native types for JSON serialization"""
    result = {}
    for key, series in df_dict.items():
        if hasattr(series, 'to_list'):  # Check if it's a Series-like object
            result[key] = series.to_list()
        else:
            result[key] = series
    return result

@optimize_bp.route('/api/optimize', methods=['POST'])
def optimize():
    """Process uploaded files and run inventory optimization algorithms"""
    logger.info("Optimization endpoint called")
    try:
        data = request.json
        logger.debug(f"Received optimization request data: {json.dumps(data, default=str)[:1000]}...")
        
        if not data or 'files' not in data:
            logger.warning("No data provided or missing files information")
            return jsonify({"error": "No data provided or missing files information"}), 400
        
        file_paths = [file['parquet_path'] for file in data['files'] if 'parquet_path' in file]
        logger.info(f"Files to process: {file_paths}")
        
        if not file_paths:
            logger.warning("No valid file paths provided")
            return jsonify({"error": "No valid file paths provided"}), 400
        
        # Run optimization algorithm
        logger.info("Starting optimization process")
        optimization_results = optimize_inventory(file_paths)
        logger.info(f"Optimization completed. Result shape: {optimization_results.shape}")
        
        # Format and save output
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"optimization_results_{timestamp}.csv"
        output_path = os.path.join(current_app.config['OUTPUT_FOLDER'], output_filename)
        
        logger.info(f"Formatting and saving results to: {output_path}")
        format_output(optimization_results, output_path)
        
        # Prepare summary statistics
        summary = {
            "totalSavings": float(optimization_results["cost_savings"].sum()),
            "averageStockReduction": float(optimization_results["stock_reduction_pct"].mean()),
            "optimizationDate": datetime.now().isoformat()
        }
        logger.info(f"Summary statistics: {summary}")
        
        # Convert to JSON serializable format
        result_data = convert_to_json_serializable(optimization_results.to_dict())
        
        response_data = {
            "message": "Optimization completed successfully",
            "summary": summary,
            "data": result_data,
            "output_file": output_filename
        }
        logger.debug(f"Sending response with {len(optimization_results)} rows of data")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in optimization process: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500 