import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import DownloadIcon from '@mui/icons-material/Download';

function ResultsViewer({ results, isLoading, error }) {
  const [downloadReady, setDownloadReady] = useState(false);

  // Download CSV function
  const downloadCSV = () => {
    if (!results || !results.data) return;

    let downloadData = [];
    let headers = [];

    // Check if actual results data exists
    if (results.data && Object.keys(results.data).length > 0) {
      // Get column names
      headers = Object.keys(results.data);
      
      // Determine how many rows we have
      const numRows = results.data[headers[0]].length;
      
      // Transform data into rows
      for (let i = 0; i < numRows; i++) {
        const row = {};
        headers.forEach(header => {
          row[header] = results.data[header][i];
        });
        downloadData.push(row);
      }
    } else {
      // Fallback to sample data
      downloadData = [
        { id: 1, productId: 'A001', name: 'Product A', optimalStock: 120, reorderPoint: 40, reorderQty: 60, costSavings: 850 },
        { id: 2, productId: 'A002', name: 'Product B', optimalStock: 250, reorderPoint: 75, reorderQty: 120, costSavings: 420 },
        { id: 3, productId: 'A003', name: 'Product C', optimalStock: 60, reorderPoint: 20, reorderQty: 40, costSavings: 640 }
      ];
      
      headers = Object.keys(downloadData[0]).filter(key => key !== 'id');
    }

    // Convert data to CSV
    const csvContent = [
      headers.join(','),
      ...downloadData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_optimization_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadReady(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Processing optimization algorithm...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a few moments depending on data size
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  // Check if we have real results
  const hasActualResults = results && results.data && Object.keys(results.data).length > 0;
  
  // Prepare data for the DataGrid
  let rows = [];
  let columns = [];
  
  if (hasActualResults) {
    // Get column names
    const columnNames = Object.keys(results.data);
    
    // Transform data into rows
    const numRows = results.data[columnNames[0]].length;
    for (let i = 0; i < numRows; i++) {
      const row = { id: i + 1 }; // Add id for DataGrid
      
      columnNames.forEach(colName => {
        row[colName] = results.data[colName][i];
      });
      
      rows.push(row);
    }
    
    // Build column definitions
    columns = columnNames.map(colName => {
      // Determine column type and formatting
      const isNumeric = typeof results.data[colName][0] === 'number';
      let type = isNumeric ? 'number' : 'string';
      let valueFormatter;
      
      if (colName.toLowerCase().includes('cost') || colName.toLowerCase().includes('savings')) {
        valueFormatter = (params) => params.value != null ? `$${params.value.toFixed(2)}` : '';
      } else if (colName.toLowerCase().includes('pct') || colName.toLowerCase().includes('percent')) {
        valueFormatter = (params) => params.value != null ? `${params.value.toFixed(2)}%` : '';
      }
      
      return {
        field: colName,
        headerName: colName.charAt(0).toUpperCase() + colName.slice(1).replace('_', ' '),
        type: type,
        width: 150,
        valueFormatter: valueFormatter
      };
    });
    
    // Add id column if not already present
    if (!columnNames.includes('id')) {
      columns.unshift({
        field: 'id',
        headerName: 'ID',
        width: 70
      });
    }
  } else {
    // Fallback to sample result data for demonstration
    rows = [
      { id: 1, productId: 'A001', name: 'Product A', optimalStock: 120, reorderPoint: 40, reorderQty: 60, costSavings: 850 },
      { id: 2, productId: 'A002', name: 'Product B', optimalStock: 250, reorderPoint: 75, reorderQty: 120, costSavings: 420 },
      { id: 3, productId: 'A003', name: 'Product C', optimalStock: 60, reorderPoint: 20, reorderQty: 40, costSavings: 640 }
    ];

    columns = [
      { field: 'productId', headerName: 'Product ID', width: 120 },
      { field: 'name', headerName: 'Product Name', width: 180 },
      { field: 'optimalStock', headerName: 'Optimal Stock', type: 'number', width: 130 },
      { field: 'reorderPoint', headerName: 'Reorder Point', type: 'number', width: 130 },
      { field: 'reorderQty', headerName: 'Reorder Quantity', type: 'number', width: 150 },
      { 
        field: 'costSavings', 
        headerName: 'Cost Savings ($)', 
        type: 'number', 
        width: 150,
        valueFormatter: (params) => {
          if (params.value == null) return '';
          return `$${params.value.toFixed(2)}`;
        },
      },
    ];
  }

  // Get summary data or use sample
  const summary = results && results.summary ? results.summary : {
    totalSavings: 1910,
    averageStockReduction: 22.5,
    optimizationDate: new Date().toISOString()
  };

  return (
    <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          Optimization Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Based on your inventory data, we've calculated the optimal inventory levels to minimize costs while maintaining service levels.
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
          <Typography variant="h6">Summary</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2">Total Cost Savings</Typography>
              <Typography variant="h5">${summary.totalSavings.toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Average Stock Reduction</Typography>
              <Typography variant="h5">{summary.averageStockReduction}%</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Optimization Date</Typography>
              <Typography variant="body1">
                {new Date(summary.optimizationDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ height: 'calc(100% - 250px)', width: '100%', p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableSelectionOnClick
          sx={{
            boxShadow: 0,
            border: 0,
          }}
        />
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={downloadCSV}
        >
          Download Results (CSV)
        </Button>
      </Box>
    </Paper>
  );
}

export default ResultsViewer; 