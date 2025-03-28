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
  Tabs,
  Tab,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilePreview from '../components/csv/FilePreview';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the API service URL
const API_URL = 'http://localhost:5000/api';

function DataManagementPage() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const navigate = useNavigate();

  // Fetch all uploaded files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, you would have an endpoint to get all files
      // For now, we'll check the localStorage as a workaround
      const fileData = localStorage.getItem('uploadedFiles');
      if (fileData) {
        const parsedFiles = JSON.parse(fileData);
        setFiles(parsedFiles);
      } else {
        // If there's no data in localStorage, simulate a backend call
        // This is where you would normally call your backend API
        try {
          const response = await axios.get(`${API_URL}/health`);
          console.log('Backend is healthy:', response.data);
          
          // No files uploaded - redirect to upload page
          setNotification({
            open: true,
            message: 'No files available. Redirecting to upload page...',
            severity: 'info'
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/inventory-optimization');
          }, 2000);
          
          return; // Exit early
        } catch (error) {
          console.error('Error checking backend health:', error);
          
          // For demo purposes, create some dummy files
          // In a real app, you would redirect to upload page
          const dummyFiles = [
            {
              name: 'inventory_data_2024.csv',
              parquet_path: 'backend/uploads/inventory_data_2024_20240328_120145.parquet',
              columns: ['product_id', 'name', 'current_stock', 'unit_cost', 'lead_time_days', 'daily_demand'],
              preview: {
                product_id: ['A001', 'A002', 'A003', 'B001', 'B002'],
                name: ['Widget A', 'Widget B', 'Widget C', 'Product D', 'Product E'],
                current_stock: [150, 300, 75, 120, 200],
                unit_cost: [20.50, 15.75, 35.20, 12.30, 8.45],
                lead_time_days: [5, 7, 3, 10, 4],
                daily_demand: [12, 25, 8, 15, 30]
              }
            },
            {
              name: 'supplier_data_2024.csv',
              parquet_path: 'backend/uploads/supplier_data_2024_20240328_120146.parquet',
              columns: ['product_id', 'supplier', 'lead_time_days', 'min_order_qty', 'shipping_cost'],
              preview: {
                product_id: ['A001', 'A002', 'A003', 'B001', 'B002'],
                supplier: ['Supplier X', 'Supplier Y', 'Supplier Z', 'Supplier X', 'Supplier Y'],
                lead_time_days: [5, 7, 3, 10, 4],
                min_order_qty: [50, 100, 25, 75, 150],
                shipping_cost: [45.00, 35.50, 55.25, 40.00, 30.75]
              }
            }
          ];
          
          setFiles(dummyFiles);
          
          // Save to localStorage for persistence between page refreshes
          localStorage.setItem('uploadedFiles', JSON.stringify(dummyFiles));
        }
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setError('Failed to fetch files. Please try again.');
      setNotification({
        open: true,
        message: 'Failed to fetch files. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedFileIndex(newValue);
  };

  const handleNavigateToUpload = () => {
    navigate('/data-upload');
  };

  const handleNavigateToOptimization = () => {
    // Save selected files to localStorage for use in optimization page
    localStorage.setItem('filesToOptimize', JSON.stringify(files));
    
    // Also save a flag to indicate that optimization was run
    localStorage.setItem('optimizationResults', 'true');
    
    navigate('/optimization-results');
  };

  const handleNavigateToHub = () => {
    navigate('/inventory-optimization');
  };

  const handleEditCell = (columnName, rowIndex) => {
    if (!files[selectedFileIndex]?.preview) return;
    
    const filePreview = files[selectedFileIndex].preview;
    const value = filePreview[columnName][rowIndex];
    
    setEditData({
      columnName,
      value: value !== null && value !== undefined ? String(value) : ''
    });
    setEditRowIndex(rowIndex);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditData(null);
    setEditRowIndex(null);
  };

  const handleEditSave = () => {
    if (!editData || editRowIndex === null) return;
    
    // Create a deep copy of the files array
    const updatedFiles = [...files];
    const file = {...updatedFiles[selectedFileIndex]};
    const preview = {...file.preview};
    
    // Update the specific value
    const columnValues = [...preview[editData.columnName]];
    
    // Convert to appropriate type if needed
    let newValue = editData.value;
    if (!isNaN(newValue) && newValue !== '') {
      newValue = parseFloat(newValue);
    }
    
    columnValues[editRowIndex] = newValue;
    preview[editData.columnName] = columnValues;
    
    // Update the file with the new preview
    file.preview = preview;
    updatedFiles[selectedFileIndex] = file;
    
    // Update state and localStorage
    setFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    
    // Close dialog
    handleEditDialogClose();
    
    // Show notification
    setNotification({
      open: true,
      message: 'Data updated successfully.',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleDeleteFile = (index) => {
    // Remove file from the array
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    
    // Update state and localStorage
    setFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    
    // If no files left, redirect to upload
    if (updatedFiles.length === 0) {
      // Remove uploaded files flag
      localStorage.removeItem('uploadedFiles');
      
      setNotification({
        open: true,
        message: 'All files deleted. Redirecting to Inventory Optimization hub...',
        severity: 'info'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/inventory-optimization');
      }, 2000);
      
      return;
    }
    
    // Reset selected file index if needed
    if (selectedFileIndex >= updatedFiles.length) {
      setSelectedFileIndex(Math.max(0, updatedFiles.length - 1));
    }
    
    // Show notification
    setNotification({
      open: true,
      message: 'File deleted successfully.',
      severity: 'success'
    });
  };

  const handleRunOptimization = () => {
    // Set loading state
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Check if we're using real or demo data
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        const isDemoData = !uploadedFiles.some(file => file.parquet_path?.includes('_20240328_120145'));
        
        if (isDemoData) {
          console.log('Using demo data - skipping actual API call');
          // Create demo optimization results
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
            output_file: "optimization_results_demo.csv"
          };
          localStorage.setItem('demoOptimizationResults', JSON.stringify(dummyResults));
          
          // Set flag indicating we're using demo data
          localStorage.setItem('usingDemoData', 'true');
        }
        
        // Set flag in localStorage indicating optimization has been run
        localStorage.setItem('optimizationResults', 'true');
        
        // Navigate to optimization results page
        navigate('/optimization-results');
      } catch (error) {
        setError('Failed to run optimization. Please try again.');
        console.error('Optimization error:', error);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Data Management
        </Typography>
        
        <Box>
          <Button 
            variant="text" 
            onClick={handleNavigateToHub}
            sx={{ mr: 2 }}
          >
            Back to Hub
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<FileUploadIcon />} 
            sx={{ mr: 2 }}
            onClick={handleNavigateToUpload}
          >
            Upload More Files
          </Button>
          
          <Button 
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={handleNavigateToOptimization}
            disabled={files.length === 0}
          >
            Run Optimization
          </Button>
        </Box>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {files.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No files uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload some CSV files to get started with inventory optimization.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<FileUploadIcon />}
            onClick={handleNavigateToUpload}
          >
            Upload Files
          </Button>
        </Paper>
      )}
      
      {files.length > 0 && !loading && (
        <Box>
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={selectedFileIndex} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {files.map((file, index) => (
                <Tab 
                  key={index} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {file.name}
                      <IconButton 
                        size="small" 
                        sx={{ ml: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(index);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  } 
                />
              ))}
            </Tabs>
            
            {files[selectedFileIndex] && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {files[selectedFileIndex].name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {files[selectedFileIndex].columns.map((column, index) => (
                      <Chip 
                        key={index} 
                        label={column} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Box>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Data Preview and Edit
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Click on any cell to edit the value. Note that changes are only saved in the browser for demonstration purposes.
                    </Typography>
                    
                    {files[selectedFileIndex].preview && (
                      <Box sx={{ mt: 2, overflowX: 'auto' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                              <Box sx={{ width: 80, p: 1, fontWeight: 'bold', borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                Row
                              </Box>
                              {files[selectedFileIndex].columns.map((column, idx) => (
                                <Box key={idx} sx={{ 
                                  flexGrow: 1, 
                                  p: 1, 
                                  fontWeight: 'bold',
                                  minWidth: 120,
                                  borderRight: idx < files[selectedFileIndex].columns.length - 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none'
                                }}>
                                  {column}
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                          
                          {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <Grid item xs={12} key={rowIndex}>
                              <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                <Box sx={{ 
                                  width: 80, 
                                  p: 1, 
                                  bgcolor: 'grey.100',
                                  fontWeight: 'bold',
                                  borderRight: '1px solid rgba(224, 224, 224, 1)'
                                }}>
                                  {rowIndex + 1}
                                </Box>
                                {files[selectedFileIndex].columns.map((column, colIndex) => {
                                  const value = files[selectedFileIndex].preview[column][rowIndex];
                                  return (
                                    <Box key={colIndex} sx={{ 
                                      flexGrow: 1, 
                                      p: 1,
                                      position: 'relative',
                                      minWidth: 120,
                                      borderRight: colIndex < files[selectedFileIndex].columns.length - 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none',
                                      '&:hover': {
                                        bgcolor: 'action.hover',
                                        '& .edit-icon': {
                                          opacity: 1
                                        }
                                      }
                                    }} onClick={() => handleEditCell(column, rowIndex)}>
                                      {value !== null && value !== undefined ? String(value) : '(empty)'}
                                      <IconButton 
                                        size="small" 
                                        className="edit-icon"
                                        sx={{ 
                                          position: 'absolute', 
                                          top: 0,
                                          right: 0,
                                          opacity: 0,
                                          transition: 'opacity 0.2s'
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleNavigateToOptimization}
                    >
                      Optimize This Data
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            )}
          </Paper>
        </Box>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Cell Value</DialogTitle>
        <DialogContent>
          {editData && (
            <TextField
              autoFocus
              margin="dense"
              label={editData.columnName}
              fullWidth
              variant="outlined"
              value={editData.value}
              onChange={(e) => setEditData({ ...editData, value: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
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

export default DataManagementPage; 