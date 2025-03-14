import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import { SportsGolf as SportsGolfIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 5,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <SportsGolfIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          페이지를 찾을 수 없습니다
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          찾으시는 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            size="large"
            startIcon={<SportsGolfIcon />}
          >
            홈으로 돌아가기
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 