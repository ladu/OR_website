import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Alert, 
  Snackbar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploader from '../components/csv/FileUploader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Define the API service URL
const API_URL = 'http://localhost:5000/api';

function DataUploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  const handleFilesUploaded = async (uploadedFiles) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file.originalFile);
      });
      
      // Try to make API call to upload files
      try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Handle successful upload
        console.log('Files uploaded successfully:', response.data);
        
        setNotification({
          open: true,
          message: `Successfully uploaded ${response.data.files.length} files.`,
          severity: 'success'
        });
        
        // Store the real file data
        localStorage.setItem('uploadedFiles', JSON.stringify(response.data.files));
        localStorage.setItem('filesToOptimize', JSON.stringify(response.data.files));
        localStorage.setItem('usingDemoData', 'false');
      } catch (apiError) {
        console.warn('API upload failed, using demo mode:', apiError);
        
        // For demo purposes, create sample files
        const sampleColumns = ['product_id', 'name', 'current_stock', 'unit_cost', 'lead_time_days', 'daily_demand'];
        const sampleData = {
          product_id: ['A001', 'A002', 'A003', 'B001', 'B002'],
          name: ['Widget A', 'Widget B', 'Widget C', 'Product D', 'Product E'],
          current_stock: [150, 300, 75, 120, 200],
          unit_cost: [20.50, 15.75, 35.20, 12.30, 8.45],
          lead_time_days: [5, 7, 3, 10, 4],
          daily_demand: [12, 25, 8, 15, 30]
        };
        
        const demoFiles = uploadedFiles.map(file => ({
          id: 'file_' + Date.now(),
          name: file.name,
          size: file.size,
          date: new Date().toISOString(),
          columns: sampleColumns,
          rows: 250 + Math.floor(Math.random() * 1000),
          preview: sampleData
        }));
        
        // Store demo files in localStorage
        localStorage.setItem('uploadedFiles', JSON.stringify(demoFiles));
        localStorage.setItem('filesToOptimize', JSON.stringify(demoFiles));
        localStorage.setItem('usingDemoData', 'true');
        
        setNotification({
          open: true,
          message: 'Using demo mode for uploaded files',
          severity: 'info'
        });
      }
      
      // Set data ready flag
      localStorage.setItem('dataReady', 'true');
      
      // Navigate to data management page after successful upload
      setTimeout(() => {
        navigate('/data-management');
      }, 2000);
      
    } catch (error) {
      console.error('Error in file upload process:', error);
      setError('Failed to process uploaded files. Please try again.');
      setNotification({
        open: true,
        message: 'Failed to process files. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleFinalize = () => {
    // Set flag in localStorage indicating data is available for optimization
    localStorage.setItem('dataReady', 'true');
    
    // Navigate to the data management page
    navigate('/data-management');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Upload
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload Inventory Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload CSV files containing your inventory data. The files will be processed and made available for optimization.
            </Typography>
            
            <FileUploader onFilesUploaded={handleFilesUploaded} />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required CSV Format
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your CSV files should include the following columns:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="product_id" 
                    secondary="Unique identifier for each product" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="name" 
                    secondary="Product name or description" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="current_stock" 
                    secondary="Current inventory level" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="unit_cost" 
                    secondary="Cost per unit of inventory" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="lead_time_days" 
                    secondary="Time to receive order (in days)" 
                  />
                </ListItem>
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="daily_demand" 
                    secondary="Average daily demand quantity" 
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Example CSV format:
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    mt: 1, 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    overflowX: 'auto'
                  }}
                >
                  product_id,name,current_stock,unit_cost,lead_time_days,daily_demand<br/>
                  A001,Widget A,150,20.50,5,12<br/>
                  A002,Widget B,300,15.75,7,25<br/>
                  A003,Widget C,75,35.20,3,8
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
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

export default DataUploadPage; 