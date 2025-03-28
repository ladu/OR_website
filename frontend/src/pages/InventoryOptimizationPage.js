import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import InsightsIcon from '@mui/icons-material/Insights';

function InventoryOptimizationPage() {
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [hasOptimizationResults, setHasOptimizationResults] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  
  // Check localStorage on component mount to determine available steps
  useEffect(() => {
    const uploadedFiles = localStorage.getItem('uploadedFiles');
    const optimizationResults = localStorage.getItem('optimizationResults');
    
    if (uploadedFiles) {
      setHasUploadedFiles(true);
      setActiveStep(1);
    }
    
    if (optimizationResults) {
      setHasOptimizationResults(true);
      setActiveStep(2);
    }
  }, []);
  
  const steps = [
    { 
      label: 'Upload Data', 
      description: 'Upload your inventory CSV files containing product data, stock levels, and demand information.',
      icon: <FileUploadIcon sx={{ fontSize: 80 }} color="primary" />,
      enabled: true,
      path: '/data-upload'
    },
    { 
      label: 'Manage Data', 
      description: 'Review and edit your inventory data before running the optimization algorithms.',
      icon: <StorageIcon sx={{ fontSize: 80 }} color={hasUploadedFiles ? "primary" : "disabled"} />,
      enabled: hasUploadedFiles,
      path: '/data-management'
    },
    { 
      label: 'Optimization Results', 
      description: 'View optimization results and recommendations for your inventory.',
      icon: <InsightsIcon sx={{ fontSize: 80 }} color={hasOptimizationResults ? "primary" : "disabled"} />,
      enabled: hasOptimizationResults,
      path: '/optimization-results'
    }
  ];
  
  const handleNavigate = (path, enabled) => {
    if (enabled) {
      navigate(path);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Inventory Optimization Hub
      </Typography>
      
      <Paper sx={{ p: 3, mb: 5 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {activeStep === 0 && "Start by uploading your inventory data files."}
            {activeStep === 1 && "Your data is ready for review and editing."}
            {activeStep === 2 && "Your optimization results are ready to view."}
          </Typography>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        {steps.map((step, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: step.enabled ? 1 : 0.7,
                position: 'relative'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                py: 4,
                bgcolor: activeStep === index ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
              }}>
                {step.icon}
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 500 }}>
                  {step.label}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
                
                {index === 0 && !hasUploadedFiles && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 500 }}>
                      Get started here
                    </Typography>
                  </Box>
                )}
                
                {index === 1 && hasUploadedFiles && !hasOptimizationResults && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 500 }}>
                      Your current step
                    </Typography>
                  </Box>
                )}
                
                {index === 2 && hasOptimizationResults && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 500 }}>
                      Results available
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 2 }}>
                <Button 
                  fullWidth 
                  variant={activeStep === index ? "contained" : "outlined"}
                  onClick={() => handleNavigate(step.path, step.enabled)}
                  disabled={!step.enabled}
                >
                  {activeStep > index ? "View Again" : "Go to " + step.label}
                </Button>
              </CardActions>
              
              {!step.enabled && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  bottom: 0, 
                  left: 0, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.5)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    bgcolor: 'rgba(0,0,0,0.6)', 
                    color: 'white', 
                    px: 2, 
                    py: 1, 
                    borderRadius: 1
                  }}>
                    {index === 1 ? "Upload Data First" : "Run Optimization First"}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 6, p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Optimization Process
        </Typography>
        <Typography variant="body2">
          Our optimization process analyzes your inventory data to determine optimal stock levels, reorder points, and economic order quantities.
          This helps reduce carrying costs while maintaining service levels. Follow the steps above to get started.
        </Typography>
      </Box>
    </Container>
  );
}

export default InventoryOptimizationPage; 