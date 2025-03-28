import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

function DataTable({ files, onDataUpdated, onFinalize }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [editedData, setEditedData] = useState(files || []);
  const [editedRows, setEditedRows] = useState({});

  // If files are updated from parent component
  React.useEffect(() => {
    if (files && files.length > 0) {
      setEditedData([...files]);
      setCurrentTab(0);
      setEditedRows({});
    }
  }, [files]);

  if (!editedData || editedData.length === 0) {
    return (
      <Alert severity="info">
        No data available. Please upload CSV files to view and edit data.
      </Alert>
    );
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Get the current file
  const currentFile = editedData[currentTab];
  
  // Check if the current file has preview data
  const hasPreviewData = currentFile && currentFile.preview && Object.keys(currentFile.preview).length > 0;

  // Prepare rows from preview data or use empty array
  let rows = [];
  let columns = [];

  if (hasPreviewData) {
    // Get column names from preview
    const columnNames = Object.keys(currentFile.preview);
    
    // Check for id column, if not present, create one
    const hasIdColumn = columnNames.includes('id') || columnNames.includes('ID');
    
    // Transform preview data into rows
    rows = [];
    const numRows = currentFile.preview[columnNames[0]].length;
    
    for (let i = 0; i < numRows; i++) {
      const row = {};
      
      // Add id if not present
      if (!hasIdColumn) {
        row.id = i + 1;
      }
      
      // Build row from each column
      columnNames.forEach(colName => {
        row[colName] = currentFile.preview[colName][i];
        
        // If this is the id column, ensure it's used as the row id
        if (colName.toLowerCase() === 'id') {
          row.id = currentFile.preview[colName][i];
        }
      });
      
      rows.push(row);
    }
    
    // Build column definitions
    columns = columnNames.map(colName => {
      // Determine column type
      let type = 'string';
      const sampleValue = currentFile.preview[colName][0];
      
      if (typeof sampleValue === 'number') {
        type = 'number';
      } else if (sampleValue instanceof Date) {
        type = 'date';
      } else if (typeof sampleValue === 'boolean') {
        type = 'boolean';
      }
      
      return {
        field: colName,
        headerName: colName.charAt(0).toUpperCase() + colName.slice(1).replace('_', ' '),
        width: 150,
        editable: colName.toLowerCase() !== 'id',
        type: type
      };
    });
    
    // Add id column if not present
    if (!hasIdColumn) {
      columns.unshift({
        field: 'id',
        headerName: 'ID',
        width: 70,
        editable: false
      });
    }
  } else {
    // Fallback to sample data if no preview is available
    rows = [
      { id: 1, product_id: 'A001', name: 'Product A', category: 'Electronics', price: 299.99, stock: 150 },
      { id: 2, product_id: 'A002', name: 'Product B', category: 'Home & Kitchen', price: 49.99, stock: 300 },
      { id: 3, product_id: 'A003', name: 'Product C', category: 'Electronics', price: 199.99, stock: 75 }
    ];

    columns = [
      { field: 'id', headerName: 'ID', width: 70, editable: false },
      { field: 'product_id', headerName: 'Product ID', width: 130, editable: true },
      { field: 'name', headerName: 'Name', width: 200, editable: true },
      { field: 'category', headerName: 'Category', width: 150, editable: true },
      { 
        field: 'price', 
        headerName: 'Price ($)', 
        type: 'number', 
        width: 110, 
        editable: true,
        valueFormatter: (params) => {
          if (params.value == null) return '';
          return `$${params.value.toFixed(2)}`;
        },
      },
      { 
        field: 'stock', 
        headerName: 'Stock', 
        type: 'number', 
        width: 110, 
        editable: true 
      },
    ];
  }

  // Handle row editing
  const handleCellEdit = (params) => {
    // In a real app, you'd update the data structure properly
    // This is simplified for demonstration
    const updatedRows = { ...editedRows };
    updatedRows[params.id] = true;
    setEditedRows(updatedRows);
    
    // Notify parent component of data changes
    if (onDataUpdated) {
      onDataUpdated(editedData);
    }
  };

  const handleFinalizeData = () => {
    if (onFinalize) {
      onFinalize(editedData);
    }
  };

  return (
    <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {editedData.map((file, index) => (
            <Tab key={index} label={file.name || `File ${index + 1}`} />
          ))}
        </Tabs>
      </Box>
      
      <Box sx={{ height: 'calc(100% - 100px)', width: '100%', p: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
          {currentFile ? currentFile.name : 'Data Table'} 
          {Object.keys(editedRows).length > 0 && ' (Edited)'}
        </Typography>
        
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableSelectionOnClick
          onCellEditCommit={handleCellEdit}
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            boxShadow: 0,
            border: 0,
            borderColor: 'primary.light',
            '& .MuiDataGrid-cell--editing': {
              bgcolor: 'rgb(255,215,115, 0.19)',
              padding: '0 0 0 5px',
              color: '#1a3e72',
            },
            '& .Mui-error': {
              bgcolor: (theme) => `rgb(126,10,15, ${theme.palette.mode === 'dark' ? 0 : 0.1})`,
              color: (theme) => theme.palette.mode === 'dark' ? '#ff4343' : '#750f0f',
            },
          }}
        />
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinalizeData}
          disabled={editedData.length === 0}
        >
          Finalize Data
        </Button>
      </Box>
    </Paper>
  );
}

export default DataTable; 