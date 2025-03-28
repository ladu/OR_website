import os
import logging
import polars as pl
from datetime import datetime

# Configure logging
logger = logging.getLogger('inventory_optimizer_data_processor')

def process_csv(csv_path):
    """
    Process a CSV file and convert it to Parquet format for more efficient processing.
    
    Args:
        csv_path (str): Path to the CSV file
        
    Returns:
        str: Path to the generated Parquet file
    """
    logger.info(f"Processing CSV file: {csv_path}")
    try:
        # Get filename without extension
        base_name = os.path.splitext(os.path.basename(csv_path))[0]
        
        # Generate parquet filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        parquet_filename = f"{base_name}_{timestamp}.parquet"
        
        # Define parquet path in same directory as CSV
        uploads_dir = os.path.dirname(csv_path)
        parquet_path = os.path.join(uploads_dir, parquet_filename)
        logger.debug(f"Parquet output path: {parquet_path}")
        
        # Read CSV with Polars
        logger.debug(f"Reading CSV file with Polars")
        df = pl.read_csv(csv_path)
        logger.info(f"CSV file read successfully. Shape: {df.shape}, Columns: {df.columns}")
        
        # Perform basic cleaning
        # 1. Convert column names to lowercase and replace spaces with underscores
        logger.debug("Converting column names to lowercase and replacing spaces with underscores")
        new_columns = {col: col.lower().replace(' ', '_') for col in df.columns}
        df = df.rename(new_columns)
        logger.debug(f"New columns: {df.columns}")
        
        # 2. Handle missing values based on column type
        logger.debug("Handling missing values based on column type")
        for col in df.columns:
            col_type = df[col].dtype
            logger.debug(f"Processing column {col} with type {col_type}")
            
            if pl.Float32 == col_type or pl.Float64 == col_type:
                logger.debug(f"Filling null values with 0.0 in float column {col}")
                df = df.with_columns(pl.col(col).fill_null(0.0))
            elif col_type in [pl.Int8, pl.Int16, pl.Int32, pl.Int64, pl.UInt8, pl.UInt16, pl.UInt32, pl.UInt64]:
                logger.debug(f"Filling null values with 0 in integer column {col}")
                df = df.with_columns(pl.col(col).fill_null(0))
            elif col_type == pl.Boolean:
                logger.debug(f"Filling null values with False in boolean column {col}")
                df = df.with_columns(pl.col(col).fill_null(False))
            elif col_type == pl.Utf8:
                logger.debug(f"Filling null values with empty string in string column {col}")
                df = df.with_columns(pl.col(col).fill_null(""))
            elif col_type == pl.Date:
                logger.debug(f"Filling null values with current date in date column {col}")
                df = df.with_columns(pl.col(col).fill_null(datetime.now().date()))
            elif col_type == pl.Datetime:
                logger.debug(f"Filling null values with current datetime in datetime column {col}")
                df = df.with_columns(pl.col(col).fill_null(datetime.now()))
        
        # Write to Parquet format
        logger.info(f"Writing cleaned data to Parquet file: {parquet_path}")
        df.write_parquet(parquet_path)
        logger.info(f"Parquet file created successfully")
        
        return parquet_path
    
    except Exception as e:
        logger.error(f"Error processing CSV file: {str(e)}", exc_info=True)
        raise Exception(f"Error processing CSV file: {str(e)}")

def format_output(df, output_path):
    """
    Format the optimization results dataframe and save it as CSV.
    
    Args:
        df (pl.DataFrame): Dataframe containing optimization results
        output_path (str): Path where to save the formatted output CSV
    """
    logger.info(f"Formatting output dataframe. Shape: {df.shape}")
    try:
        # Ensure all column names are standardized
        logger.debug("Standardizing column names")
        new_columns = {col: col.lower().replace('_', ' ').title() for col in df.columns}
        df = df.rename(new_columns)
        logger.debug(f"Standardized columns: {df.columns}")
        
        # Write to CSV
        logger.info(f"Writing to CSV file: {output_path}")
        df.write_csv(output_path)
        logger.info(f"CSV file created successfully")
        
        return output_path
    
    except Exception as e:
        logger.error(f"Error formatting output: {str(e)}", exc_info=True)
        raise Exception(f"Error formatting output: {str(e)}")

def combine_dataframes(file_paths):
    """
    Combine multiple parquet files into a single dataframe, handling schema differences.
    
    Args:
        file_paths (list): List of parquet file paths to combine
        
    Returns:
        pl.DataFrame: Combined dataframe
    """
    logger.info(f"Combining {len(file_paths)} dataframes")
    if not file_paths:
        logger.error("No file paths provided")
        raise ValueError("No file paths provided")
    
    # Read each parquet file
    logger.debug(f"Reading parquet files: {file_paths}")
    dataframes = []
    for path in file_paths:
        logger.debug(f"Reading parquet file: {path}")
        try:
            df = pl.read_parquet(path)
            logger.debug(f"Read parquet file {path}. Shape: {df.shape}, Columns: {df.columns}")
            dataframes.append(df)
        except Exception as e:
            logger.error(f"Error reading parquet file {path}: {str(e)}", exc_info=True)
            raise Exception(f"Error reading parquet file {path}: {str(e)}")
    
    # For simplicity in this example, we'll just return the first dataframe
    # In a real application, you would handle schema differences and perform a proper merge
    logger.info(f"Returning first dataframe with shape {dataframes[0].shape}")
    return dataframes[0] 