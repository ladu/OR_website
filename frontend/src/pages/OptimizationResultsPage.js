import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory';
import OptimizationResults from '../components/inventory/OptimizationResults';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the API service URL
const API_URL = 'http://localhost:5000/api';

function OptimizationResultsPage() {
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if optimization has been run
    const hasOptimizationResults = localStorage.getItem('optimizationResults');
    
    if (!hasOptimizationResults) {
      setNotification({
        open: true,
        message: 'No optimization results available. Redirecting to the Inventory Optimization hub...',
        severity: 'info'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/inventory-optimization');
      }, 2000);
      
      return; // Exit early
    }
    
    // Check if we have files to optimize
    const filesToOptimize = localStorage.getItem('filesToOptimize');
    if (!filesToOptimize) {
      setError('No files available for optimization. Please upload files first.');
      return;
    }
    
    // Run optimization on page load
    runOptimization();
  }, [navigate]);

  const runOptimization = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      // Check if we're using demo data
      const usingDemoData = localStorage.getItem('usingDemoData') === 'true';
      
      if (usingDemoData) {
        console.log('Using demo optimization results');
        const demoResults = JSON.parse(localStorage.getItem('demoOptimizationResults'));
        
        if (demoResults) {
          // Small delay to simulate processing
          await new Promise(resolve => setTimeout(resolve, 1500));
          setOptimizationResults(demoResults);
          
          setNotification({
            open: true,
            message: 'Demo optimization results loaded',
            severity: 'info'
          });
          return;
        }
      }
      
      // Normal API flow for real data
      // Get files from localStorage
      const filesToOptimize = JSON.parse(localStorage.getItem('filesToOptimize'));
      
      if (!filesToOptimize || filesToOptimize.length === 0) {
        throw new Error('No files available for optimization');
      }
      
      // Make API call to optimize
      const response = await axios.post(`${API_URL}/optimize`, {
        files: filesToOptimize
      });
      
      // Handle successful optimization
      console.log('Optimization completed:', response.data);
      setOptimizationResults(response.data);
      
      setNotification({
        open: true,
        message: 'Inventory optimization completed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error during optimization:', error);
      setError(error.response?.data?.error || 'Failed to complete optimization. Please try again.');
      
      // For demo purposes, create dummy optimization results
      const dummyResults = {
        message: "Optimization completed successfully",
        summary: {
          totalSavings: 1560.75,
          averageStockReduction: 20.5,
          optimizationDate: new Date().toISOString()
        },
        data: {
          product_id: ['A001', 'A002', 'A003', 'B001', 'B002'],
          name: ['Widget A', 'Widget B', 'Widget C', 'Product D', 'Product E'],
          current_stock: [150, 300, 75, 120, 200],
          optimal_stock: [120, 250, 60, 95, 160],
          reorder_point: [40, 75, 20, 30, 50],
          economic_order_qty: [60, 120, 30, 45, 80],
          cost_savings: [450.75, 315.25, 340.50, 228.75, 225.50],
          stock_reduction_pct: [20.0, 16.7, 20.0, 20.8, 20.0]
        },
        output_file: "optimization_results_20240328_125436.csv"
      };
      
      setOptimizationResults(dummyResults);
      
      setNotification({
        open: true,
        message: 'Using simulation data as optimization backend call failed',
        severity: 'warning'
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownloadResults = () => {
    if (optimizationResults && optimizationResults.output_file) {
      // In a real app, this would be the actual download URL
      window.open(`${API_URL}/download/${optimizationResults.output_file}`, '_blank');
      
      setNotification({
        open: true,
        message: 'Download started',
        severity: 'info'
      });
    }
  };

  const handleExportToCsv = () => {
    if (!optimizationResults || !optimizationResults.data) return;
    
    // Convert optimization data to CSV
    const columns = Object.keys(optimizationResults.data);
    const rows = [];
    
    // Get number of rows from the first column
    const numRows = optimizationResults.data[columns[0]].length;
    
    // Build CSV header
    let csvContent = columns.join(',') + '\n';
    
    // Build CSV rows
    for (let i = 0; i < numRows; i++) {
      const row = columns.map(col => {
        const value = optimizationResults.data[col][i];
        // Handle special characters and commas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
      
      csvContent += row + '\n';
    }
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `optimization_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setNotification({
      open: true,
      message: 'CSV file exported successfully',
      severity: 'success'
    });
  };

  const handleBackToData = () => {
    navigate('/data-management');
  };
  
  const handleBackToHub = () => {
    navigate('/inventory-optimization');
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            sx={{ mr: 1 }} 
            onClick={handleBackToHub}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Optimization Results
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            onClick={handleBackToData}
            sx={{ mr: 2 }}
          >
            Back to Data
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<CloudDownloadIcon />}
            onClick={handleExportToCsv}
            disabled={!optimizationResults}
            sx={{ mr: 2 }}
          >
            Export to CSV
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownloadResults}
            disabled={!optimizationResults}
          >
            Download Full Results
          </Button>
        </Box>
      </Box>
      
      {(loading || optimizing) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {optimizing ? 'Running optimization algorithms...' : 'Loading results...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a moment depending on the size of your data.
          </Typography>
        </Box>
      )}
      
      {error && !optimizationResults && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<InventoryIcon />}
            onClick={() => navigate('/inventory-optimization')}
          >
            Return to Hub
          </Button>
        </Paper>
      )}
      
      {optimizationResults && (
        <Box>
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5">
                    ${optimizationResults.summary.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2">Total Cost Savings</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5">
                    {(optimizationResults.summary.averageStockReduction / 100).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 })}
                  </Typography>
                  <Typography variant="body2">Avg. Stock Reduction</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h5">
                    {new Date(optimizationResults.summary.optimizationDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">Optimization Date</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Optimization Results
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The optimization algorithm has analyzed your inventory data and calculated the optimal stock levels, 
              reorder points, and economic order quantities to minimize your inventory costs while maintaining service levels.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <OptimizationResults results={optimizationResults.data} />
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Actions
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                1. Review and Implement Inventory Changes
              </Typography>
              <Typography variant="body2" paragraph>
                Adjust your inventory levels according to the optimal stock levels calculated. 
                This will help reduce holding costs while maintaining service levels.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                2. Update Reorder Points in Your System
              </Typography>
              <Typography variant="body2" paragraph>
                Configure your inventory management system with the new reorder points.
                This ensures you order new stock at the right time.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                3. Optimize Order Quantities
              </Typography>
              <Typography variant="body2" paragraph>
                Use the economic order quantities (EOQ) when placing new orders.
                This balances ordering costs with holding costs.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                4. Monitor Performance
              </Typography>
              <Typography variant="body2">
                Track the performance of these changes over time and run optimization 
                regularly to adjust for changing demand patterns.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default OptimizationResultsPage; 