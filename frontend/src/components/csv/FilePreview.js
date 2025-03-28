import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';

function FilePreview({ file }) {
  if (!file || !file.preview) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No preview available for this file.
        </Typography>
      </Box>
    );
  }

  // Extract columns and rows from the preview data
  const columns = Object.keys(file.preview);
  
  // Get the length of the first column's data array
  const rowCount = columns.length > 0 ? file.preview[columns[0]].length : 0;
  
  // Function to determine cell color based on content
  const getCellColor = (value) => {
    if (value === null || value === undefined || value === '') {
      return '#fff0f0'; // Light red for empty/null values
    }
    return 'inherit';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" component="div" sx={{ mr: 2 }}>
          {file.name}
        </Typography>
        <Chip 
          label={`${rowCount} rows`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={`${columns.length} columns`} 
          size="small" 
          color="primary" 
          variant="outlined" 
          sx={{ ml: 1 }} 
        />
      </Box>
      
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                Row
              </TableCell>
              {columns.map((column) => (
                <TableCell 
                  key={column} 
                  sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText' }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex} hover>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                  {rowIndex + 1}
                </TableCell>
                {columns.map((column) => {
                  const value = file.preview[column][rowIndex];
                  return (
                    <TableCell 
                      key={`${column}-${rowIndex}`} 
                      sx={{ bgcolor: getCellColor(value) }}
                    >
                      {value !== null && value !== undefined ? String(value) : '(empty)'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Showing preview data. The full file will be processed during optimization.
      </Typography>
    </Box>
  );
}

export default FilePreview; 