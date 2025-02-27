import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { Delete, FilterList, Sort } from '@mui/icons-material';

interface PlateResult {
  id: string;
  numberplate: string;
  timestamp: number;
  confidence?: number;
}

type SortOrder = 'newest' | 'oldest' | 'alphabetical';

const GalleryPage = () => {
  const [plates, setPlates] = useState<PlateResult[]>([]);
  const [filteredPlates, setFilteredPlates] = useState<PlateResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plateToDelete, setPlateToDelete] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [noPlatesFound, setNoPlatesFound] = useState(false);

  // Load plates from localStorage
  useEffect(() => {
    const savedPlates = localStorage.getItem('plates');
    if (savedPlates) {
      const parsedPlates: PlateResult[] = JSON.parse(savedPlates);
      setPlates(parsedPlates);
      setNoPlatesFound(parsedPlates.length === 0);
    } else {
      setNoPlatesFound(true);
    }
  }, []);

  // Filter and sort plates when search term or sort order changes
  useEffect(() => {
    let result = [...plates];
    
    // Apply filter
    if (searchTerm) {
      result = result.filter(plate => 
        plate.numberplate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        result.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.numberplate.localeCompare(b.numberplate));
        break;
    }
    
    setFilteredPlates(result);
  }, [plates, searchTerm, sortOrder]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle sort order change
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as SortOrder);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setPlateToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setPlateToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Delete plate
  const deletePlate = () => {
    if (plateToDelete) {
      const updatedPlates = plates.filter(plate => plate.id !== plateToDelete);
      setPlates(updatedPlates);
      localStorage.setItem('plates', JSON.stringify(updatedPlates));
      setNoPlatesFound(updatedPlates.length === 0);
      closeDeleteDialog();
    }
  };

  // Clear all plates
  const clearAllPlates = () => {
    setPlates([]);
    localStorage.removeItem('plates');
    setNoPlatesFound(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search numberplates"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="e.g. ABC123"
              size="small"
              InputProps={{
                startAdornment: <FilterList sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label">Sort by</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortOrder}
                label="Sort by"
                onChange={handleSortChange}
                startAdornment={<Sort sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* No results message */}
      {noPlatesFound && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No numberplates found. Capture some plates using the camera.
        </Alert>
      )}

      {/* Plates list */}
      {!noPlatesFound && (
        <Paper>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {filteredPlates.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No matches found" 
                  secondary="Try a different search term" 
                />
              </ListItem>
            ) : (
              filteredPlates.map((plate, index) => (
                <Box key={plate.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => openDeleteDialog(plate.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {plate.numberplate}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(plate.timestamp).toLocaleString()}
                          </Typography>
                          {plate.confidence !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              Confidence: {Math.round(plate.confidence * 100)}%
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < filteredPlates.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </List>
          
          {/* Clear all button */}
          {plates.length > 0 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => {
                  setPlateToDelete('all');
                  setDeleteDialogOpen(true);
                }}
              >
                Clear All Plates
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>
          {plateToDelete === 'all' ? 'Clear All Plates' : 'Delete Plate'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {plateToDelete === 'all'
              ? 'Are you sure you want to clear all numberplates? This action cannot be undone.'
              : 'Are you sure you want to delete this numberplate? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button 
            onClick={plateToDelete === 'all' ? clearAllPlates : deletePlate} 
            color="error" 
            autoFocus
          >
            {plateToDelete === 'all' ? 'Clear All' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GalleryPage; 