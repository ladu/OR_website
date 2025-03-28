import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

function FileUploader({ onFilesUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const parseCSV = (csvText) => {
    try {
      // Split the text into lines
      const lines = csvText.split(/\r\n|\n/);
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }
      
      // Parse the header row
      const headers = lines[0].split(',').map(header => header.trim());
      
      // Initialize the result object with arrays for each column
      const result = {};
      headers.forEach(header => {
        result[header] = [];
      });
      
      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        const values = line.split(',');
        
        // Add each value to the appropriate column array
        headers.forEach((header, index) => {
          let value = values[index] ? values[index].trim() : '';
          
          // Try to convert numeric values
          if (!isNaN(value) && value !== '') {
            value = parseFloat(value);
          }
          
          result[header].push(value);
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error parsing CSV:', err);
      throw new Error('Failed to parse CSV file. Please check the format.');
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Check if files are CSV
    const nonCsvFiles = selectedFiles.filter(file => !file.name.endsWith('.csv'));
    if (nonCsvFiles.length > 0) {
      setError(`Files must be CSV format: ${nonCsvFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setError(null);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    
    // Check if files are CSV
    const nonCsvFiles = droppedFiles.filter(file => !file.name.endsWith('.csv'));
    if (nonCsvFiles.length > 0) {
      setError(`Files must be CSV format: ${nonCsvFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setError(null);
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Mock upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Array to hold the processed files
      const processedFiles = [];
      
      // Process each file
      for (const file of files) {
        // Read the file content
        const fileContent = await readFileAsText(file);
        
        // Parse the CSV content
        const parsedData = parseCSV(fileContent);
        
        // Add the processed file to the array
        processedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          preview: parsedData,
          originalFile: file  // Store the original file object for backend upload
        });
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded(processedFiles);
      }
      
      // Reset the uploader state
      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload files: ' + error.message);
      clearInterval(interval);
      setUploading(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <UploadBox
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-input').click()}
      >
        <CloudUploadIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag and drop CSV files here
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or
        </Typography>
        <Button 
          component="label" 
          variant="contained" 
          disabled={uploading}
        >
          Browse Files
          <VisuallyHiddenInput
            id="file-input"
            type="file"
            multiple
            accept=".csv"
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Only CSV files are accepted
        </Typography>
      </UploadBox>
      
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                />
                <Chip 
                  label="CSV" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 1 }} 
                />
              </ListItem>
            ))}
          </List>
          
          {uploading ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={uploadFiles} 
              sx={{ mt: 2 }}
              disabled={files.length === 0}
            >
              Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default FileUploader; 