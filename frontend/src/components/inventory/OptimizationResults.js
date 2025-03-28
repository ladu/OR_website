import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function OptimizationResults({ results }) {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('cost_savings');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  if (!results) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No optimization results available.
        </Typography>
      </Box>
    );
  }

  // Extract columns and rows from the data
  const columns = Object.keys(results);
  
  // Create rows from the columnar data
  const rows = [];
  if (columns.length > 0) {
    const rowCount = results[columns[0]].length;
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      columns.forEach(column => {
        row[column] = results[column][i];
      });
      rows.push(row);
    }
  }

  // Filter rows based on search term
  const filteredRows = rows.filter(row => {
    if (searchTerm === '') return true;
    
    // Search in string columns
    return Object.entries(row).some(([key, value]) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  });

  // Column definitions
  const tableColumns = [
    { id: 'product_id', label: 'Product ID', numeric: false },
    { id: 'name', label: 'Product Name', numeric: false },
    { id: 'current_stock', label: 'Current Stock', numeric: true, format: (value) => value.toFixed(0) },
    { id: 'optimal_stock', label: 'Optimal Stock', numeric: true, format: (value) => value.toFixed(0) },
    { id: 'reorder_point', label: 'Reorder Point', numeric: true, format: (value) => value.toFixed(0) },
    { id: 'economic_order_qty', label: 'EOQ', numeric: true, format: (value) => value.toFixed(0) },
    { 
      id: 'cost_savings', 
      label: 'Cost Savings', 
      numeric: true, 
      format: (value) => `$${value.toFixed(2)}` 
    },
    { 
      id: 'stock_reduction_pct', 
      label: 'Stock Reduction', 
      numeric: true, 
      format: (value) => `${value.toFixed(1)}%` 
    },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sort and paginate rows
  const sortedRows = stableSort(filteredRows, getComparator(order, orderBy));
  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Content for different tabs
  const renderTableTab = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
      <Table size="small" aria-label="optimization results table">
        <TableHead>
          <TableRow>
            {tableColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.numeric ? 'right' : 'left'}
                sortDirection={orderBy === column.id ? order : false}
                sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'primary.contrastText' }}
              >
                {column.id === 'stock_reduction_pct' ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                    IconComponent={orderBy === column.id && order === 'desc' ? ArrowDropDownIcon : ArrowDropUpIcon}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((row, index) => (
            <TableRow key={index} hover>
              {tableColumns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                    {column.format && value !== undefined ? column.format(value) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          {paginatedRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={tableColumns.length} align="center">
                No matching results found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          {filteredRows.length} products optimized
        </Typography>
        
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ width: 250 }}
        />
      </Box>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Table View" />
      </Tabs>
      
      {activeTab === 0 && renderTableTab()}
    </Box>
  );
}

export default OptimizationResults; 