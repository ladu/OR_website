import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';

function AboutPage() {
  const teamMembers = [
    {
      name: 'Jane Smith',
      role: 'CEO & Founder',
      bio: 'Expert in supply chain management with over 15 years of experience in the industry.',
      image: 'https://via.placeholder.com/300x300',
    },
    {
      name: 'John Doe',
      role: 'CTO',
      bio: 'Data scientist with a background in operations research and machine learning.',
      image: 'https://via.placeholder.com/300x300',
    },
    {
      name: 'Alex Johnson',
      role: 'Head of Operations',
      bio: 'Specializes in integrating technology solutions into business operations.',
      image: 'https://via.placeholder.com/300x300',
    },
  ];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            At Inventory Optimizer, our mission is to help businesses optimize their inventory
            management through data-driven solutions. We believe that efficient inventory 
            management is crucial for businesses to minimize costs and maximize profitability.
          </Typography>
          <Typography variant="body1" paragraph>
            Our team of experts combines deep industry knowledge with advanced technology to 
            provide solutions that are tailored to your business needs. We are committed to 
            helping our clients achieve operational excellence through better inventory management.
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 6 }} />
        
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Our Approach
          </Typography>
          <Typography variant="body1" paragraph>
            We take a holistic approach to inventory optimization that considers the entire supply chain.
            Our methodology involves:
          </Typography>
          <ul>
            <Typography component="li" variant="body1">
              Data analysis to identify patterns and inefficiencies
            </Typography>
            <Typography component="li" variant="body1">
              Advanced forecasting techniques to predict demand
            </Typography>
            <Typography component="li" variant="body1">
              Optimization algorithms to determine optimal inventory levels
            </Typography>
            <Typography component="li" variant="body1">
              Continuous monitoring and adaptation to changing conditions
            </Typography>
          </ul>
        </Box>
        
        <Divider sx={{ mb: 6 }} />
        
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member) => (
              <Grid item key={member.name} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={member.image}
                    alt={member.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutPage; 