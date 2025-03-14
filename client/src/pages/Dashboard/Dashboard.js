import React from 'react';
import { Typography, Box, Container, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';

function Dashboard() {
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          골프 시뮬레이터 분석 대시보드
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          라운드 데이터를 분석하여 인사이트를 제공합니다.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="최근 라운드" />
            <CardContent>
              <Typography variant="body1">
                최근 라운드 데이터가 여기에 표시됩니다.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="통계 요약" />
            <CardContent>
              <Typography variant="body1">
                통계 요약 정보가 여기에 표시됩니다.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="성능 추이" />
            <CardContent>
              <Typography variant="body1">
                성능 추이 차트가 여기에 표시됩니다.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 