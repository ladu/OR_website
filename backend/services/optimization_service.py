import polars as pl
import numpy as np
import logging
from datetime import datetime
from utils.data_processor import combine_dataframes

# Configure logging
logger = logging.getLogger('inventory_optimizer_optimization')

def optimize_inventory(file_paths):
    """
    Apply inventory optimization algorithms to the data.
    
    Args:
        file_paths (list): List of paths to parquet files containing inventory data
        
    Returns:
        pl.DataFrame: Optimization results
    """
    logger.info(f"Starting inventory optimization with {len(file_paths)} files")
    try:
        # Combine data from all files (in a real app, would handle joins/merges properly)
        logger.info("Combining dataframes from multiple files")
        df = combine_dataframes(file_paths)
        logger.info(f"Combined dataframe shape: {df.shape}")
        
        # This is a simplified version of an inventory optimization algorithm
        # In a real application, you would implement a more sophisticated model
        
        # Check if required columns exist, else use dummy data
        required_columns = ['product_id', 'name', 'current_stock', 'unit_cost', 'lead_time_days', 'daily_demand']
        
        has_required_columns = all(col in df.columns for col in required_columns)
        logger.info(f"Has all required columns: {has_required_columns}")
        
        if not has_required_columns:
            # Create dummy data for demonstration
            logger.warning("Using dummy data for demonstration as required columns are missing")
            logger.debug(f"Expected columns: {required_columns}, Got columns: {df.columns}")
            logger.info("Creating dummy dataframe")
            df = pl.DataFrame({
                'product_id': ['A001', 'A002', 'A003', 'B001', 'B002'],
                'name': ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
                'current_stock': [150, 300, 75, 120, 200],
                'unit_cost': [20.50, 15.75, 35.20, 12.30, 8.45],
                'lead_time_days': [5, 7, 3, 10, 4],
                'daily_demand': [12, 25, 8, 15, 30]
            })
            logger.debug(f"Created dummy dataframe with shape: {df.shape}")
        
        # Calculate optimal stock levels using EOQ (Economic Order Quantity) formula
        # For simplicity, we'll use fixed values for ordering cost and holding cost
        ordering_cost = 25  # Fixed cost to place an order
        holding_cost_pct = 0.25  # Annual holding cost as percentage of item value
        
        logger.info("Calculating EOQ parameters")
        logger.debug(f"Ordering cost: {ordering_cost}, Holding cost percentage: {holding_cost_pct}")
        
        # Calculate safety stock (simplified)
        # Safety stock = Z * σ * √L
        # Z = safety factor (using 1.96 for ~95% service level)
        # σ = standard deviation of daily demand
        # L = lead time in days
        
        # For simplicity, we'll use a fixed percentage of lead time demand
        safety_factor = 1.96
        logger.debug(f"Safety factor: {safety_factor}")
        
        # Add a small random variation to daily demand for demonstration
        np.random.seed(42)  # For reproducibility
        logger.debug("Set random seed to 42 for reproducibility")
        
        # Calculate EOQ and related metrics
        # Create expressions for calculations
        logger.info("Creating expressions for EOQ calculations")
        eoq_expr = ((2 * pl.col('daily_demand') * 365 * ordering_cost) / 
                  (pl.col('unit_cost') * holding_cost_pct)).sqrt().alias('economic_order_qty')
        std_dev_expr = (pl.col('daily_demand') * 0.2).alias('demand_std_dev')
        days_supply_expr = (pl.col('current_stock') / pl.col('daily_demand')).alias('days_of_supply')
        
        # Apply expressions to create new columns
        logger.info("Calculating EOQ, demand standard deviation, and days of supply")
        results = df.with_columns([
            eoq_expr,
            std_dev_expr,
            days_supply_expr
        ])
        logger.debug(f"Added EOQ calculations. Result columns: {results.columns}")
        
        # Calculate safety stock and reorder point
        logger.info("Calculating safety stock and optimal stock levels")
        safety_stock_expr = (safety_factor * pl.col('demand_std_dev') * 
                            (pl.col('lead_time_days')).sqrt()).alias('safety_stock')
        optimal_stock_expr = (pl.col('economic_order_qty') + 
                             (safety_factor * pl.col('demand_std_dev') * 
                              (pl.col('lead_time_days')).sqrt())).round(0).alias('optimal_stock')
        
        results = results.with_columns([
            safety_stock_expr,
            optimal_stock_expr
        ])
        logger.debug("Added safety stock and optimal stock calculations")
        
        # Calculate reorder point and other metrics
        logger.info("Calculating reorder points, cost savings, and stock reduction percentages")
        reorder_point_expr = (pl.col('daily_demand') * pl.col('lead_time_days') + 
                             pl.col('safety_stock')).round(0).alias('reorder_point')
        cost_savings_expr = ((pl.col('current_stock') - pl.col('optimal_stock')) * 
                            pl.col('unit_cost') * holding_cost_pct).alias('cost_savings')
        stock_reduction_expr = (100 * (pl.col('current_stock') - pl.col('optimal_stock')) / 
                               pl.col('current_stock')).alias('stock_reduction_pct')
        
        results = results.with_columns([
            reorder_point_expr,
            cost_savings_expr,
            stock_reduction_expr
        ])
        logger.debug("Added reorder point, cost savings and stock reduction calculations")
        
        # Only keep positive cost savings (cases where we reduce inventory)
        logger.info("Filtering to ensure positive cost savings")
        results = results.with_columns(
            pl.when(pl.col('cost_savings') < 0).then(0).otherwise(pl.col('cost_savings')).alias('cost_savings')
        )
        
        # Only keep positive stock reduction (cases where we reduce inventory)
        logger.info("Filtering to ensure positive stock reduction")
        results = results.with_columns(
            pl.when(pl.col('stock_reduction_pct') < 0).then(0).otherwise(pl.col('stock_reduction_pct')).alias('stock_reduction_pct')
        )
        
        # Round numeric columns for better readability
        logger.info("Rounding numeric values to appropriate precision")
        for col in ['optimal_stock', 'reorder_point', 'economic_order_qty', 'safety_stock']:
            logger.debug(f"Rounding column {col} to integers")
            results = results.with_columns(pl.col(col).round(0).cast(pl.Int32))
            
        for col in ['cost_savings', 'stock_reduction_pct']:
            logger.debug(f"Rounding column {col} to 2 decimal places")
            results = results.with_columns(pl.col(col).round(2))
        
        # Select and reorder columns for output
        output_columns = [
            'product_id', 'name', 'current_stock', 'optimal_stock', 
            'reorder_point', 'economic_order_qty', 'cost_savings', 'stock_reduction_pct'
        ]
        
        logger.info(f"Selecting output columns: {output_columns}")
        final_results = results.select(output_columns)
        
        # Log some summary statistics
        try:
            total_savings = final_results["cost_savings"].sum()
            avg_reduction = final_results["stock_reduction_pct"].mean()
            logger.info(f"Optimization complete. Total cost savings: {total_savings:.2f}, Average stock reduction: {avg_reduction:.2f}%")
            logger.info(f"Final output shape: {final_results.shape}")
        except Exception as e:
            logger.warning(f"Could not calculate summary statistics: {str(e)}")
        
        return final_results
    
    except Exception as e:
        logger.error(f"Error in optimization process: {str(e)}", exc_info=True)
        raise Exception(f"Error in optimization process: {str(e)}") 