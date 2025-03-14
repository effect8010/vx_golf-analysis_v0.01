import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

const RoundDetail = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoundDetail = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 대신 예시 데이터 사용
        // const response = await getRoundDetail(roundId);
        
        // 테스트용 더미 데이터
        setTimeout(() => {
          const dummyRound = {
            round_id: parseInt(roundId),
            course_name: '써니밸리 CC',
            first_course_name: '동코스',
            first_course_number: 1,
            second_course_name: '서코스',
            second_course_number: 2,
            round_date: new Date().toISOString().split('T')[0],
            round_time: '09:30',
            weather_condition: '맑음',
            temperature: 22,
            total_score: 75,
            fairway_hit: 9,
            green_hit: 11,
            putting: 32,
            notes: '좋은 컨디션이었음'
          };
          setRound(dummyRound);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('라운드 상세 데이터 조회 오류:', err);
        setError('라운드 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchRoundDetail();
  }, [roundId]);

  const handleEdit = () => {
    navigate(`/rounds/edit/${roundId}`);
  };

  const handleBack = () => {
    navigate('/rounds');
  };

  // 날씨 아이콘 표시 함수
  const getWeatherIcon = (weather) => {
    switch(weather) {
      case '맑음': return '☀️';
      case '흐림': return '☁️';
      case '비': return '🌧️';
      case '눈': return '❄️';
      case '바람': return '💨';
      default: return '🌤️';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2 }}>
          돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">라운드 상세정보</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          수정하기
        </Button>
      </Box>

      {round && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {round.course_name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {formatDate(round.round_date)} {round.round_time}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                <Chip 
                  label={`${getWeatherIcon(round.weather_condition)} ${round.weather_condition} ${round.temperature}°C`} 
                  variant="outlined" 
                  sx={{ mb: 1 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>코스 정보</Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary">전반 코스</Typography>
                    <Typography variant="h6">
                      {round.first_course_name} {round.first_course_number}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary">후반 코스</Typography>
                    <Typography variant="h6">
                      {round.second_course_name} {round.second_course_number}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>스코어 및 통계</Typography>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>총 스코어</Typography>
                    <Typography variant="h4">{round.total_score}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>페어웨이 안착</Typography>
                    <Typography variant="h4">{round.fairway_hit}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>그린 적중</Typography>
                    <Typography variant="h4">{round.green_hit}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>퍼팅 수</Typography>
                    <Typography variant="h4">{round.putting}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {round.notes && (
              <>
                <Typography variant="h6" gutterBottom>메모</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography>{round.notes}</Typography>
                </Paper>
              </>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default RoundDetail; 