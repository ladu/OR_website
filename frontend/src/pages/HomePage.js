import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import InventoryIcon from '@mui/icons-material/Inventory';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import InsightsIcon from '@mui/icons-material/Insights';

function HomePage() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            p: 6,
            mb: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Optimize Your Inventory Management
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Advanced analytics and data-driven solutions to manage your inventory more efficiently
          </Typography>
          <Button
            component={Link}
            to="/inventory-optimization"
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 3 }}
          >
            Get Started
          </Button>
        </Box>

        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Our Platform
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <FileUploadIcon color="primary" sx={{ fontSize: 64 }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Upload Data
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload your inventory data in CSV format. Our system will process and prepare it for analysis.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  to="/data-upload"
                  size="small"
                  sx={{ ml: 'auto', mr: 'auto' }}
                >
                  Upload Files
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <StorageIcon color="primary" sx={{ fontSize: 64 }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Manage Data
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View and edit your uploaded inventory data. Make adjustments before running the optimization.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={Link}
                  to="/data-management"
                  size="small" 
                  sx={{ ml: 'auto', mr: 'auto' }}
                >
                  Manage Files
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <InsightsIcon color="primary" sx={{ fontSize: 64 }} />
                </Box>
                <Typography gutterBottom variant="h5" component="div" align="center">
                  Optimization Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get detailed recommendations for optimizing stock levels, reducing costs, and improving service levels.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  component={Link}
                  to="/optimization-results"
                  size="small" 
                  sx={{ ml: 'auto', mr: 'auto' }}
                >
                  View Results
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            How It Works
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  1. Upload Your Data
                </Typography>
                <Typography variant="body1">
                  Upload your inventory CSV files with product information, stock levels, costs, and demand data.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  2. Review and Edit
                </Typography>
                <Typography variant="body1">
                  Preview your data, make any necessary edits, and prepare it for optimization analysis.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  3. Get Optimization Results
                </Typography>
                <Typography variant="body1">
                  Our algorithms calculate optimal stock levels, reorder points, and potential cost savings.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Button
            component={Link}
            to="/inventory-optimization"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 4 }}
          >
            Start Optimizing Your Inventory
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage; 