import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Link,
  useTheme,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from '@mui/material';
import {
  SportsGolf as SportsGolfIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Check as CheckIcon,
  ArrowDropUp as ArrowUpIcon,
  ArrowDropDown as ArrowDownIcon,
} from '@mui/icons-material';

// 차트 컴포넌트
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// API 서비스
import { getUserStats, getUserTrendStats, getPartnerStats } from '../../services/statsService';
import { getRoundHistory } from '../../services/roundService';

// 차트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trendStats, setTrendStats] = useState(null);
  const [recentRounds, setRecentRounds] = useState([]);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // 디버깅 정보
  const [roundsCountView, setRoundsCountView] = useState('5');
  const theme = useTheme();

  // 데이터 로딩 함수
  const loadDashboardData = async (retryCount = 0) => {
    const maxRetries = 2; // 최대 재시도 횟수
    
    // 디버깅용 데이터 객체
    const debugData = {
      timestamp: new Date().toISOString(),
      statsData: {},
      trendData: {},
      roundsData: {},
      partnerData: {}
    };
    
    // 기본 데이터 구조
    const defaultStatsData = {
      status: 'success',
      data: {
        overallStats: {
          totalRounds: 0,
          avgScore: 0,
          bestScore: 0,
          fairwayHitRate: 0,
          greenHitRate: 0,
          averagePutts: 0,
          drivingDistance: 0,
          birdieRate: 0,
          parRate: 0,
          bogeyRate: 0
        },
        trendData: [],
        clubStats: []
      }
    };
    
    // 통계 데이터 로딩
    try {
      console.log("통계 데이터 요청 시작");
      const statsData = await getUserStats();
      setStats(statsData);
      debugData.statsData = { success: true, data: statsData };
      console.log("통계 데이터 로드 성공:", statsData);
    } catch (statsErr) {
      console.error('사용자 통계 로딩 에러:', statsErr);
      debugData.statsData = { 
        success: false, 
        error: statsErr.message || '알 수 없는 오류'
      };
      
      // 오류 발생 시 기본 데이터 구조 사용
      setStats(defaultStatsData);
      debugData.statsData.defaultDataUsed = true;
      
      // 네트워크 오류인 경우 재시도
      if (retryCount < maxRetries && isNetworkError(statsErr)) {
        console.log(`통계 데이터 로딩 재시도 (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => loadDashboardData(retryCount + 1), 1000);
        return;
      }
    }

    // 추이 데이터 로딩
    try {
      console.log("추이 데이터 요청 시작");
      const trendData = await getUserTrendStats(null, 'month', 6);
      setTrendStats(trendData);
      debugData.trendData = { success: true, data: trendData };
      console.log("추이 데이터 로드 성공:", trendData);
    } catch (trendErr) {
      console.error('추이 데이터 로딩 에러:', trendErr);
      debugData.trendData = { 
        success: false, 
        error: trendErr.message || '알 수 없는 오류'
      };
      
      // 빈 추이 데이터 사용
      setTrendStats({status: 'success', data: []});
      debugData.trendData.defaultDataUsed = true;
    }

    // 최근 라운드 데이터 로딩
    try {
      console.log("라운드 기록 요청 시작");
      const roundsData = await getRoundHistory(10);
      setRecentRounds(roundsData.data || []);
      debugData.roundsData = { success: true, data: roundsData };
      console.log("라운드 기록 로드 성공:", roundsData);
    } catch (roundsErr) {
      console.error('라운드 데이터 로딩 에러:', roundsErr);
      debugData.roundsData = { 
        success: false, 
        error: roundsErr.message || '알 수 없는 오류'
      };
      
      // 빈 라운드 데이터 사용
      setRecentRounds([]);
      debugData.roundsData.defaultDataUsed = true;
      
      // 네트워크 오류인 경우 재시도
      if (retryCount < maxRetries && isNetworkError(roundsErr)) {
        console.log(`라운드 데이터 로딩 재시도 (${retryCount + 1}/${maxRetries})...`);
        // 다른 데이터는 이미 로드되었으므로 로딩만 재시도
        setTimeout(async () => {
          try {
            const retryRoundsData = await getRoundHistory(10, true); // 캐시 무시
            setRecentRounds(retryRoundsData.data || []);
            console.log("라운드 기록 재로드 성공:", retryRoundsData);
          } catch (retryErr) {
            console.error('라운드 데이터 재로드 실패:', retryErr);
          }
        }, 1500);
      }
    }

    // 동반자 통계 로딩
    try {
      console.log("파트너 통계 요청 시작");
      const partnerStats = await getPartnerStats();
      setPartners(partnerStats || []);
      debugData.partnerData = { success: true, data: partnerStats };
      console.log("파트너 통계 로드 성공:", partnerStats);
    } catch (partnerErr) {
      console.error('파트너 통계 로딩 에러:', partnerErr);
      debugData.partnerData = { 
        success: false, 
        error: partnerErr.message || '알 수 없는 오류'
      };
      
      // 빈 파트너 통계 사용
      setPartners([]);
      debugData.partnerData.defaultDataUsed = true;
    }

    // 디버깅 정보 로깅
    console.log('대시보드 데이터 로딩 완료 - 디버그 정보:', debugData);
    setLoading(false);
  };

  // 네트워크 오류 확인 함수
  const isNetworkError = (error) => {
    return (
      !error.response || 
      error.code === 'ECONNABORTED' ||
      error.message.includes('Network Error') ||
      error.message.includes('timeout')
    );
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 스코어 추이 차트 데이터
  const scoreChartData = {
    labels: recentRounds.slice(0, parseInt(roundsCountView)).map(round => new Date(round.roundDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })).reverse(),
    datasets: [
      {
        label: '스코어',
        data: recentRounds.slice(0, parseInt(roundsCountView)).map(round => round.totalScore).reverse(),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '20',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: theme.palette.primary.main,
        pointRadius: 4,
      },
    ],
  };

  const scoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        reverse: false,
        min: Math.max(60, Math.min(...recentRounds.slice(0, parseInt(roundsCountView)).map(round => round.totalScore || 0)) - 10),
        max: Math.min(120, Math.max(...recentRounds.slice(0, parseInt(roundsCountView)).map(round => round.totalScore || 0)) + 10),
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // 클럽 거리 차트 데이터
  const clubDistanceData = {
    labels: stats?.clubStats?.map(club => club.club) || [],
    datasets: [
      {
        label: '평균 비거리(야드)',
        data: stats?.clubStats?.map(club => club.averageDistance) || [],
        backgroundColor: theme.palette.info.main + '90',
        borderWidth: 1,
      },
    ],
  };

  const clubDistanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '클럽별 평균 비거리',
      },
    },
  };

  const handleRoundsViewChange = (event, newValue) => {
    if (newValue !== null) {
      setRoundsCountView(newValue);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
        p={3}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        
        {debugInfo && (
          <Card sx={{ mt: 2, width: '100%', maxWidth: 800 }}>
            <CardHeader title="디버깅 정보" />
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </Typography>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  API 상태:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="사용자 통계 API" 
                      secondary={debugInfo.statsData?.success ? '성공' : `실패: ${debugInfo.statsData?.error || '불명확한 오류'}`} 
                      primaryTypographyProps={{
                        color: debugInfo.statsData?.success ? 'success.main' : 'error'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="추이 데이터 API" 
                      secondary={debugInfo.trendData?.success ? '성공' : `실패: ${debugInfo.trendData?.error || '불명확한 오류'}`} 
                      primaryTypographyProps={{
                        color: debugInfo.trendData?.success ? 'success.main' : 'error'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="라운드 기록 API" 
                      secondary={debugInfo.roundsData?.success ? '성공' : `실패: ${debugInfo.roundsData?.error || '불명확한 오류'}`} 
                      primaryTypographyProps={{
                        color: debugInfo.roundsData?.success ? 'success.main' : 'error'
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="동반자 통계 API" 
                      secondary={debugInfo.partnerData?.success ? '성공' : `실패: ${debugInfo.partnerData?.error || '불명확한 오류'}`} 
                      primaryTypographyProps={{
                        color: debugInfo.partnerData?.success ? 'success.main' : 'error'
                      }}
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.reload()}
              >
                페이지 새로고침
              </Button>
            </CardActions>
          </Card>
        )}
      </Box>
    );
  }

  // 사용자 목표 데이터 (예시)
  const goals = [
    {
      id: 'handicap',
      title: '핸디캡 10 달성',
      current: stats?.user?.handicap || 12.5,
      target: 10.0,
      unit: '',
      progress: Math.min(100, Math.max(0, (1 - ((stats?.user?.handicap || 12.5) - 10) / 10) * 100)),
      icon: 'H',
      color: 'primary',
    },
    {
      id: 'avg_score',
      title: '평균 스코어 80 달성',
      current: stats?.overallStats?.averageScore || 85.3,
      target: 80.0,
      unit: '',
      progress: Math.min(100, Math.max(0, (1 - ((stats?.overallStats?.averageScore || 85.3) - 80) / 20) * 100)),
      icon: 'S',
      color: 'secondary',
    },
    {
      id: 'green_hit',
      title: '그린 적중률 60% 달성',
      current: (stats?.overallStats?.greenHitRate || 0.528) * 100,
      target: 60.0,
      unit: '%',
      progress: Math.min(100, Math.max(0, ((stats?.overallStats?.greenHitRate || 0.528) * 100) / 60 * 100)),
      icon: 'G',
      color: 'success',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>데이터를 불러오는 중...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            서버 연결을 확인하시거나 잠시 후 다시 시도해 주세요.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </Box>
      ) : (
        <>
          {/* 통계 요약 카드 - 4개 카드 레이아웃 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  평균 스코어
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h3" fontWeight={600}>
                    {stats?.data?.overallStats?.avgScore?.toFixed(1) || '-'}
                  </Typography>
                  <SportsGolfIcon color="primary" fontSize="large" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  최근 10 라운드 기준
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2, 
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  베스트 스코어
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h3" fontWeight={600}>
                    {stats?.data?.overallStats?.bestScore || '-'}
                  </Typography>
                  <TimelineIcon color="success" fontSize="large" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  역대 최고 기록
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  드라이버 거리
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h3" fontWeight={600}>
                    {stats?.data?.overallStats?.drivingDistance?.toFixed(1) || '-'}
                  </Typography>
                  <TrendingUpIcon color="info" fontSize="large" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  평균 드라이버 거리 (야드)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  라운드 횟수
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h3" fontWeight={600}>
                    {stats?.data?.overallStats?.totalRounds || '0'}
                  </Typography>
                  <FlagIcon color="warning" fontSize="large" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  전체 라운드 횟수
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* 차트 및 통계 정보 */}
          <Grid container spacing={3}>
            {/* 최근 라운드 스코어 차트 */}
            <Grid item xs={12} md={8}>
              <Card elevation={2}>
                <CardHeader 
                  title="최근 라운드 스코어" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                  action={
                    <ToggleButtonGroup
                      value={roundsCountView}
                      exclusive
                      onChange={handleRoundsViewChange}
                      size="small"
                      aria-label="라운드 수"
                    >
                      <ToggleButton value="5" aria-label="5 라운드">
                        5 라운드
                      </ToggleButton>
                      <ToggleButton value="10" aria-label="10 라운드">
                        10 라운드
                      </ToggleButton>
                      <ToggleButton value="all" aria-label="전체">
                        전체
                      </ToggleButton>
                    </ToggleButtonGroup>
                  }
                />
                <Divider />
                <CardContent sx={{ height: 300 }}>
                  {recentRounds.length > 0 ? (
                    <Line data={scoreChartData} options={scoreChartOptions} />
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Typography variant="body1" color="text.secondary">
                        최근 라운드 데이터가 없습니다.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 퍼포먼스 통계 */}
            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardHeader 
                  title="퍼포먼스 통계" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">페어웨이 안착률</Typography>
                        <Typography variant="h6">{((stats?.data?.overallStats?.fairwayHitRate || 0) * 100)?.toFixed(1) || 0}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">그린 적중률</Typography>
                        <Typography variant="h6">{((stats?.data?.overallStats?.greenHitRate || 0) * 100)?.toFixed(1) || 0}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">버디 확률</Typography>
                        <Typography variant="h6">{((stats?.data?.overallStats?.birdieRate || 0) * 100)?.toFixed(1) || 0}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">평균 퍼팅</Typography>
                        <Typography variant="h6">{stats?.data?.overallStats?.averagePutts?.toFixed(1) || '-'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* 최근 라운드 목록 */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader 
                  title="최근 라운드" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent>
                  {recentRounds.length > 0 ? (
                    <List>
                      {recentRounds.slice(0, 5).map((round, index) => (
                        <ListItem key={index} divider={index < Math.min(recentRounds.length, 5) - 1}>
                          <ListItemText
                            primary={`${round.courseName || '코스 정보 없음'}`}
                            secondary={`${new Date(round.roundDate).toLocaleDateString('ko-KR')} / 스코어: ${round.totalScore}`}
                          />
                          {round.totalScore && (
                            <Chip 
                              label={round.totalScore} 
                              color={round.totalScore < 80 ? 'success' : round.totalScore < 90 ? 'primary' : 'warning'} 
                              size="small"
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="textSecondary">라운드 기록이 없습니다</Typography>
                      <Button 
                        component={RouterLink} 
                        to="/rounds/new" 
                        variant="contained" 
                        color="primary"
                        sx={{ mt: 2 }}
                      >
                        새 라운드 등록
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 동반자 목록 */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardHeader 
                  title="함께 플레이한 동반자" 
                  titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                />
                <Divider />
                <CardContent>
                  {partners && partners.length > 0 ? (
                    <List>
                      {partners.slice(0, 5).map((partner, index) => (
                        <ListItem key={index} divider={index < Math.min(partners.length, 5) - 1}>
                          <ListItemText
                            primary={partner.partnerName || partner.username || '이름 없음'}
                            secondary={`함께한 라운드: ${partner.roundCount || 0}회`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="textSecondary">동반자 기록이 없습니다</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 