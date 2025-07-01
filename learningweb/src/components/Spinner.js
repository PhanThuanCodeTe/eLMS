import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Spinner = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      className="bg-gray-50"
    >
      <CircularProgress
        size={40}
        thickness={4}
        sx={{
          color: '#22c55e', // Màu xanh lá tương tự border-green-500
        }}
      />
    </Box>
  );
};

export default Spinner;
