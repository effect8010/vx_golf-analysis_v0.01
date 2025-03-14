import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, ArrowForward as ArrowForwardIcon, BarChart as BarChartIcon, FilterList as FilterListIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
// 새로운 차트 라이브러리 추가
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// 라운드 데이터를 가져오는 서비스를 import 해야 합니다
// import { getRounds } from '../../services/roundService';

const Rounds = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [statsData, setStatsData] = useState({
    averageScore: 0,
    bestScore: 0,
    totalRounds: 0,
    recentAverage: 0
  });
  
  const navigate = useNavigate();

  // 라운드 데이터 가져오기
  useEffect(() => {
    const fetchRounds = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 대신 예시 데이터 사용
        // const response = await getRounds(page, rowsPerPage, startDate, endDate, searchTerm);
        
        // 테스트용 더미 데이터
        setTimeout(() => {
          const dummyData = generateDummyRounds();
          setRounds(dummyData);
          setTotalPages(Math.ceil(dummyData.length / rowsPerPage));
          
          // 통계 데이터 계산
          calculateStats(dummyData);
          
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('라운드 데이터 조회 오류:', err);
        setError('라운드 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchRounds();
  }, [page, startDate, endDate, searchTerm, courseFilter, scoreFilter]);

  // 통계 데이터 계산 함수
  const calculateStats = (roundsData) => {
    if (roundsData.length === 0) {
      setStatsData({
        averageScore: 0,
        bestScore: 0,
        totalRounds: 0,
        recentAverage: 0
      });
      return;
    }

    const scores = roundsData.map(round => round.total_score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round((totalScore / scores.length) * 10) / 10;
    const bestScore = Math.min(...scores);
    
    // 최근 5개 라운드의 평균 스코어
    const recentScores = roundsData.slice(0, 5).map(round => round.total_score);
    const recentTotal = recentScores.reduce((sum, score) => sum + score, 0);
    const recentAverage = recentScores.length > 0 ? Math.round((recentTotal / recentScores.length) * 10) / 10 : 0;

    setStatsData({
      averageScore,
      bestScore,
      totalRounds: roundsData.length,
      recentAverage
    });
  };

  // 테스트용 더미 데이터 생성 함수
  const generateDummyRounds = () => {
    const dummyRounds = [];
    const courses = ['써니밸리 CC', '레이크사이드 CC', '파인힐스 CC', '마운틴뷰 GC', '시티 GC'];
    const courses2 = ['동코스', '서코스', '남코스', '북코스', '레이크코스', '마운틴코스', '밸리코스'];
    const weathers = ['맑음', '흐림', '비', '눈', '바람'];
    
    for (let i = 1; i <= 20; i++) {
      const roundDate = new Date();
      roundDate.setDate(roundDate.getDate() - i * 2);
      
      dummyRounds.push({
        round_id: i,
        course_name: courses[Math.floor(Math.random() * courses.length)],
        first_course_number: Math.floor(Math.random() * 4) + 1,
        first_course_name: courses2[Math.floor(Math.random() * courses2.length)],
        second_course_number: Math.floor(Math.random() * 4) + 1,
        second_course_name: courses2[Math.floor(Math.random() * courses2.length)],
        round_date: roundDate.toISOString().split('T')[0],
        round_time: `${Math.floor(Math.random() * 12 + 7)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        total_score: Math.floor(Math.random() * 30) + 72,
        weather_condition: weathers[Math.floor(Math.random() * weathers.length)],
        temperature: Math.floor(Math.random() * 30) + 5,
        status: Math.random() > 0.1 ? 1 : 0  // 대부분 완료 상태, 10% 미완료
      });
    }
    
    return dummyRounds;
  };

  // 차트 데이터 준비 함수
  const prepareChartData = () => {
    return rounds.slice(0, 10).map(round => ({
      date: new Date(round.round_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      score: round.total_score,
      courseName: round.course_name.substring(0, 8) + (round.course_name.length > 8 ? '...' : '')
    })).reverse();
  };

  // 코스별 평균 스코어 차트 데이터
  const prepareCourseChartData = () => {
    const courseData = {};
    
    rounds.forEach(round => {
      if (!courseData[round.course_name]) {
        courseData[round.course_name] = {
          scores: [],
          count: 0
        };
      }
      
      courseData[round.course_name].scores.push(round.total_score);
      courseData[round.course_name].count += 1;
    });
    
    return Object.keys(courseData).map(course => ({
      name: course,
      평균: Math.round(courseData[course].scores.reduce((a, b) => a + b, 0) / courseData[course].count * 10) / 10,
      라운드수: courseData[course].count
    }));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreateRound = () => {
    navigate('/rounds/new');
  };

  const handleRoundClick = (roundId) => {
    navigate(`/rounds/${roundId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 필터링된 라운드 데이터
  const filteredRounds = rounds.filter(round => {
    let matchesCourse = true;
    let matchesScore = true;
    
    if (courseFilter) {
      matchesCourse = round.course_name.includes(courseFilter);
    }
    
    if (scoreFilter === 'under80') {
      matchesScore = round.total_score < 80;
    } else if (scoreFilter === '80to90') {
      matchesScore = round.total_score >= 80 && round.total_score < 90;
    } else if (scoreFilter === '90plus') {
      matchesScore = round.total_score >= 90;
    }
    
    return matchesCourse && matchesScore;
  });

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">내 라운드 기록</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRound}
        >
          새 라운드 기록
        </Button>
      </Box>

      {/* 통계 요약 카드 섹션 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>전체 라운드</Typography>
              <Typography variant="h4">{statsData.totalRounds}회</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>평균 스코어</Typography>
              <Typography variant="h4">{statsData.averageScore}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>최근 5라운드 평균</Typography>
              <Typography variant="h4">{statsData.recentAverage}</Typography>
              <Typography variant="body2" color={statsData.recentAverage < statsData.averageScore ? "success.main" : "error.main"}>
                {statsData.recentAverage < statsData.averageScore ? `▼ ${(statsData.averageScore - statsData.recentAverage).toFixed(1)}` : `▲ ${(statsData.recentAverage - statsData.averageScore).toFixed(1)}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>베스트 스코어</Typography>
              <Typography variant="h4">{statsData.bestScore}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 최근 라운드 차트 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>최근 라운드 스코어 추이</Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={prepareChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="스코어" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* 코스별 평균 스코어 차트 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>코스별 평균 스코어</Typography>
        <Box sx={{ height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareCourseChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="평균" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="라운드수" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>라운드 검색</Typography>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={toggleFilters}
            size="small"
          >
            {showFilters ? '필터 접기' : '상세 필터'}
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
              <DatePicker
                label="시작 날짜"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
              <DatePicker
                label="종료 날짜"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="코스명 검색"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <IconButton edge="end" onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSearch}
            >
              검색
            </Button>
          </Grid>
        </Grid>

        {/* 추가 필터 옵션 */}
        {showFilters && (
          <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={6}>
              <FormControl fullWidth>
                <InputLabel>골프 코스</InputLabel>
                <Select
                  value={courseFilter}
                  label="골프 코스"
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  {Array.from(new Set(rounds.map(round => round.course_name))).map(course => (
                    <MenuItem key={course} value={course}>{course}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <FormControl fullWidth>
                <InputLabel>스코어 범위</InputLabel>
                <Select
                  value={scoreFilter}
                  label="스코어 범위"
                  onChange={(e) => setScoreFilter(e.target.value)}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="under80">80 미만</MenuItem>
                  <MenuItem value="80to90">80~89</MenuItem>
                  <MenuItem value="90plus">90 이상</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>날짜</TableCell>
                  <TableCell>골프 코스</TableCell>
                  <TableCell>코스 정보</TableCell>
                  <TableCell align="center">날씨</TableCell>
                  <TableCell align="center">스코어</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">상세</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRounds.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((round) => (
                  <TableRow 
                    key={round.round_id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }, 
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRoundClick(round.round_id)}
                  >
                    <TableCell component="th" scope="row">
                      <Box>
                        <Typography variant="body1">{formatDate(round.round_date)}</Typography>
                        <Typography variant="body2" color="text.secondary">{round.round_time}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{round.course_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {round.first_course_name} / {round.second_course_name ? round.second_course_name : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body1">{getWeatherIcon(round.weather_condition)} {round.weather_condition}</Typography>
                        <Typography variant="body2" color="text.secondary">{round.temperature}°C</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        color={round.total_score <= 72 ? 'success.main' : 'inherit'}
                      >
                        {round.total_score}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={round.status === 1 ? "완료" : "진행중"} 
                        color={round.status === 1 ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoundClick(round.round_id);
                        }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rounds/edit/${round.round_id}`);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRounds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">라운드 기록이 없습니다.</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        onClick={handleCreateRound}
                        sx={{ mt: 2 }}
                      >
                        새 라운드 기록하기
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Rounds; 