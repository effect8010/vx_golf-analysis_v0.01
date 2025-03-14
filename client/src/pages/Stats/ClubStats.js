import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  SportsGolf as SportsGolfIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

// Chart.js 컴포넌트
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

// API 서비스
import { getUserClubStats } from '../../services/statsService';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

// 클럽 카테고리 정의
const clubCategories = [
  { id: 'driver', name: '드라이버' },
  { id: 'wood', name: '우드' },
  { id: 'iron', name: '아이언' },
  { id: 'wedge', name: '웨지' },
  { id: 'putter', name: '퍼터' }
];

const ClubStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clubStats, setClubStats] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedClub, setSelectedClub] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubStats = async () => {
      try {
        setLoading(true);
        // 클럽별 통계 데이터 가져오기
        const response = await getUserClubStats();
        setClubStats(response.data || []);
      } catch (err) {
        console.error('클럽 통계 데이터 로딩 에러:', err);
        setError('클럽 통계 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubStats();
  }, []);

  // 테스트 데이터 생성
  useEffect(() => {
    if (!clubStats || clubStats.length === 0) {
      // 테스트 데이터
      const testData = [
        // 드라이버
        {
          id: 1,
          club: '드라이버',
          clubCategory: 'driver',
          usageCount: 87,
          avgDistance: 242,
          avgCarryDistance: 230,
          avgAccuracy: 62.5,
          avgBallSpeed: 152,
          avgClubSpeed: 102,
          avgSmashFactor: 1.49,
          avgVerticalAngle: 13.2,
          avgBackSpin: 2800,
          avgSideSpin: 450,
          dispersionLeft: 12,
          dispersionRight: 8,
          shotQualityAvg: 78,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // 3번 우드
        {
          id: 2,
          club: '3번 우드',
          clubCategory: 'wood',
          usageCount: 42,
          avgDistance: 218,
          avgCarryDistance: 208,
          avgAccuracy: 68.3,
          avgBallSpeed: 145,
          avgClubSpeed: 96,
          avgSmashFactor: 1.51,
          avgVerticalAngle: 14.5,
          avgBackSpin: 3200,
          avgSideSpin: 380,
          dispersionLeft: 8,
          dispersionRight: 6,
          shotQualityAvg: 82,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // 5번 우드
        {
          id: 3,
          club: '5번 우드',
          clubCategory: 'wood',
          usageCount: 35,
          avgDistance: 204,
          avgCarryDistance: 196,
          avgAccuracy: 71.2,
          avgBallSpeed: 138,
          avgClubSpeed: 92,
          avgSmashFactor: 1.5,
          avgVerticalAngle: 15.1,
          avgBackSpin: 3600,
          avgSideSpin: 350,
          dispersionLeft: 6,
          dispersionRight: 5,
          shotQualityAvg: 84,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // 4번 아이언
        {
          id: 4,
          club: '4번 아이언',
          clubCategory: 'iron',
          usageCount: 28,
          avgDistance: 182,
          avgCarryDistance: 178,
          avgAccuracy: 73.5,
          avgBallSpeed: 132,
          avgClubSpeed: 89,
          avgSmashFactor: 1.48,
          avgVerticalAngle: 18.2,
          avgBackSpin: 4800,
          avgSideSpin: 320,
          dispersionLeft: 5,
          dispersionRight: 4,
          shotQualityAvg: 85,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // 7번 아이언
        {
          id: 5,
          club: '7번 아이언',
          clubCategory: 'iron',
          usageCount: 65,
          avgDistance: 158,
          avgCarryDistance: 154,
          avgAccuracy: 78.4,
          avgBallSpeed: 122,
          avgClubSpeed: 84,
          avgSmashFactor: 1.45,
          avgVerticalAngle: 21.5,
          avgBackSpin: 6200,
          avgSideSpin: 280,
          dispersionLeft: 4,
          dispersionRight: 3,
          shotQualityAvg: 88,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // PW
        {
          id: 6,
          club: 'PW',
          clubCategory: 'wedge',
          usageCount: 78,
          avgDistance: 128,
          avgCarryDistance: 126,
          avgAccuracy: 82.1,
          avgBallSpeed: 110,
          avgClubSpeed: 78,
          avgSmashFactor: 1.41,
          avgVerticalAngle: 24.8,
          avgBackSpin: 7800,
          avgSideSpin: 240,
          dispersionLeft: 3,
          dispersionRight: 2,
          shotQualityAvg: 90,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // SW
        {
          id: 7,
          club: 'SW',
          clubCategory: 'wedge',
          usageCount: 92,
          avgDistance: 105,
          avgCarryDistance: 102,
          avgAccuracy: 84.6,
          avgBallSpeed: 95,
          avgClubSpeed: 68,
          avgSmashFactor: 1.4,
          avgVerticalAngle: 28.2,
          avgBackSpin: 8500,
          avgSideSpin: 220,
          dispersionLeft: 2,
          dispersionRight: 2,
          shotQualityAvg: 91,
          lastUpdated: '2023-03-10T12:34:56Z'
        },
        // 퍼터
        {
          id: 8,
          club: '퍼터',
          clubCategory: 'putter',
          usageCount: 156,
          avgDistance: 8,
          avgCarryDistance: 8,
          avgAccuracy: 92.5,
          avgBallSpeed: 12,
          avgClubSpeed: 6,
          avgSmashFactor: 2.0,
          avgVerticalAngle: 0.5,
          avgBackSpin: 50,
          avgSideSpin: 10,
          dispersionLeft: 0.5,
          dispersionRight: 0.5,
          shotQualityAvg: 95,
          lastUpdated: '2023-03-10T12:34:56Z'
        }
      ];
      setClubStats(testData);
    }
  }, [clubStats]);

  // 카테고리별 클럽 필터링
  const getFilteredClubs = () => {
    if (!clubStats || clubStats.length === 0) return [];
    
    if (activeCategory === 'all') {
      return clubStats;
    }
    
    return clubStats.filter(club => club.clubCategory === activeCategory);
  };

  // 클럽 선택 핸들러
  const handleClubSelect = (club) => {
    setSelectedClub(club);
  };

  // 클럽 상세 데이터 차트 옵션
  const clubDetailChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '클럽 성능 지표'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '거리 (yards)'
        }
      }
    }
  };

  // 클럽 레이더 차트 데이터
  const getClubRadarData = (club) => {
    return {
      labels: ['캐리 거리', '정확도', '볼 스피드', '클럽 스피드', '스매시 팩터', '샷 퀄리티'],
      datasets: [
        {
          label: club.club,
          data: [
            (club.avgCarryDistance / 250) * 100, // 250야드를 만점으로 정규화
            club.avgAccuracy,
            (club.avgBallSpeed / 160) * 100, // 160mph를 만점으로 정규화
            (club.avgClubSpeed / 120) * 100, // 120mph를 만점으로 정규화
            (club.avgSmashFactor / 1.5) * 100, // 1.5를 만점으로 정규화
            club.shotQualityAvg
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    };
  };

  // 클럽 레이더 차트 옵션
  const radarChartOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          showLabelBackdrop: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            const index = context.dataIndex;
            
            // 각 항목별 실제 값 표시
            switch(index) {
              case 0: return `${label} - 캐리 거리: ${selectedClub.avgCarryDistance}야드`;
              case 1: return `${label} - 정확도: ${selectedClub.avgAccuracy}%`;
              case 2: return `${label} - 볼 스피드: ${selectedClub.avgBallSpeed}mph`;
              case 3: return `${label} - 클럽 스피드: ${selectedClub.avgClubSpeed}mph`;
              case 4: return `${label} - 스매시 팩터: ${selectedClub.avgSmashFactor}`;
              case 5: return `${label} - 샷 퀄리티: ${selectedClub.shotQualityAvg}`;
              default: return `${label}: ${value}`;
            }
          }
        }
      }
    }
  };

  // 클럽별 평균 거리 차트 데이터
  const getClubDistanceChartData = () => {
    const filteredClubs = getFilteredClubs();
    
    return {
      labels: filteredClubs.map(club => club.club),
      datasets: [
        {
          label: '평균 거리',
          data: filteredClubs.map(club => club.avgDistance),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: '평균 캐리 거리',
          data: filteredClubs.map(club => club.avgCarryDistance),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton 
            color="primary" 
            onClick={() => navigate('/stats')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            클럽별 통계
          </Typography>
        </Box>
        <Tooltip title="이 페이지에서는 각 클럽별 성능 통계를 확인할 수 있습니다">
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 클럽 카테고리 탭 */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={activeCategory}
          onChange={(_, newValue) => setActiveCategory(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="전체" value="all" />
          {clubCategories.map((category) => (
            <Tab key={category.id} label={category.name} value={category.id} />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {/* 클럽별 데이터 테이블 */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              클럽별 평균 성능
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>클럽</TableCell>
                    <TableCell align="right">사용 횟수</TableCell>
                    <TableCell align="right">평균 거리 (야드)</TableCell>
                    <TableCell align="right">정확도 (%)</TableCell>
                    <TableCell align="right">상세 보기</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredClubs().map((club) => (
                    <TableRow 
                      key={club.id}
                      hover
                      selected={selectedClub && selectedClub.id === club.id}
                      onClick={() => handleClubSelect(club)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              mr: 1, 
                              bgcolor: club.clubCategory === 'putter' 
                                ? 'success.main' 
                                : 'primary.main'
                            }}
                          >
                            {club.club.charAt(0)}
                          </Avatar>
                          {club.club}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{club.usageCount}</TableCell>
                      <TableCell align="right">{club.avgDistance}</TableCell>
                      <TableCell align="right">{club.avgAccuracy.toFixed(1)}%</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleClubSelect(club)}
                        >
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* 클럽별 평균 거리 차트 또는 선택한 클럽 상세 정보 */}
        <Grid item xs={12} lg={6}>
          {selectedClub ? (
            // 선택한 클럽 상세 정보
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  {selectedClub.club} 상세 분석
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => setSelectedClub(null)}
                >
                  전체 보기
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SportsGolfIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">기본 정보</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">클럽:</Typography>
                        <Typography variant="body2">{selectedClub.club}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">카테고리:</Typography>
                        <Typography variant="body2">
                          {clubCategories.find(c => c.id === selectedClub.clubCategory)?.name || selectedClub.clubCategory}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">사용 횟수:</Typography>
                        <Typography variant="body2">{selectedClub.usageCount}회</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">마지막 업데이트:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedClub.lastUpdated).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <SpeedIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">거리 정보</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">평균 거리:</Typography>
                        <Typography variant="body2">{selectedClub.avgDistance} 야드</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">캐리 거리:</Typography>
                        <Typography variant="body2">{selectedClub.avgCarryDistance} 야드</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">좌측 편차:</Typography>
                        <Typography variant="body2">{selectedClub.dispersionLeft} 야드</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">우측 편차:</Typography>
                        <Typography variant="body2">{selectedClub.dispersionRight} 야드</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box height={300}>
                    <Radar 
                      data={getClubRadarData(selectedClub)} 
                      options={radarChartOptions} 
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            // 클럽별 평균 거리 차트
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                클럽별 평균 거리
              </Typography>
              <Box height={400}>
                <Bar 
                  data={getClubDistanceChartData()} 
                  options={clubDetailChartOptions} 
                />
              </Box>
            </Paper>
          )}
        </Grid>
        
        {/* 추가 통계 정보 */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              클럽 사용 통계
            </Typography>
            <Typography variant="body2" paragraph>
              모든 라운드에서의 클럽 사용 통계 정보입니다. 각 클럽별 상세 정보를 확인하려면 위 표에서 클럽을 선택하세요.
            </Typography>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height={60}
              bgcolor="primary.light"
              borderRadius={1}
              p={2}
              mb={2}
            >
              <Typography variant="body1" fontWeight="bold">
                가장 자주 사용한 클럽: {
                  clubStats.length > 0 
                    ? clubStats.reduce((prev, current) => 
                        (prev.usageCount > current.usageCount) ? prev : current
                      ).club
                    : '-'
                }
              </Typography>
            </Box>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height={60}
              bgcolor="info.light"
              borderRadius={1}
              p={2}
            >
              <Typography variant="body1" fontWeight="bold">
                샷 퀄리티가 가장 높은 클럽: {
                  clubStats.length > 0 
                    ? clubStats.reduce((prev, current) => 
                        (prev.shotQualityAvg > current.shotQualityAvg) ? prev : current
                      ).club
                    : '-'
                }
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClubStats; 