import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  CircularProgress,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Chart.js 컴포넌트
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
import { Bar, Line } from 'react-chartjs-2';

// API 서비스
import { getUserStats, getUserTrendStats } from '../../services/statsService';
import { getRoundHistory } from '../../services/roundService';

// Chart.js 등록
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

const Stats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [roundHistoryFilter, setRoundHistoryFilter] = useState('5');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);
        // 사용자 종합 통계 가져오기
        const statsData = await getUserStats();
        setStats(statsData.data);
        
        // 최근 라운드 기록 가져오기
        const historyData = await getRoundHistory(10); // 기본 10개 기록
        setRoundHistory(historyData.data || []);
      } catch (err) {
        console.error('통계 데이터 로딩 에러:', err);
        setError('통계 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  // 랜덤 라운드 데이터 생성 (테스트용)
  useEffect(() => {
    if (!roundHistory || roundHistory.length === 0) {
      // 라운드 기록이 없을 경우 테스트 데이터 생성
      const testData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        courseName: `테스트 코스 ${i % 3 + 1}`,
        score: Math.floor(Math.random() * 15 + 75), // 75~90 사이 랜덤 스코어
        par: 72,
        fairwayHitRate: Math.floor(Math.random() * 30 + 50), // 50~80% 사이
        greenHitRate: Math.floor(Math.random() * 30 + 40), // 40~70% 사이
        puttsPerRound: (Math.random() * 0.5 + 1.5).toFixed(1), // 1.5~2.0 사이
      }));
      setRoundHistory(testData);
    }
  }, [roundHistory]);

  // 스탯 데이터의 증감 표시를 위한 컴포넌트
  const StatTrend = ({ value, up = false }) => (
    <Box display="flex" alignItems="center" mt={1} color={up ? 'success.main' : 'error.main'}>
      {up ? (
        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
      ) : (
        <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
      )}
      <Typography variant="body2">{value}</Typography>
    </Box>
  );

  // 목표 진행도 표시 컴포넌트
  const GoalProgress = ({ current, target, label, icon }) => (
    <Box sx={{ mb: 2, p: 1 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{label}</Typography>
          <Typography variant="body2" color="textSecondary">
            현재: {current} / 목표: {target}
          </Typography>
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={(current / target) * 100} 
        sx={{ height: 8, borderRadius: 5 }}
      />
    </Box>
  );

  // 필터링된 라운드 데이터 가져오기
  const getFilteredRoundHistory = () => {
    if (!roundHistory || roundHistory.length === 0) return [];
    
    const count = roundHistoryFilter === 'all' 
      ? roundHistory.length 
      : Math.min(parseInt(roundHistoryFilter), roundHistory.length);
    
    return roundHistory.slice(0, count);
  };

  // 라운드 스코어 차트 데이터
  const roundScoreChartData = () => {
    const filteredRounds = getFilteredRoundHistory();
    
    // 날짜가 오래된 순으로 정렬 (왼쪽에서 오른쪽으로 시간순)
    const sortedRounds = [...filteredRounds].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      labels: sortedRounds.map(round => round.date),
      datasets: [
        {
          type: 'line',
          label: '스코어',
          data: sortedRounds.map(round => round.score),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: '파 대비',
          data: sortedRounds.map(round => round.score - round.par),
          backgroundColor: sortedRounds.map(round => 
            round.score < round.par 
              ? 'rgba(75, 192, 192, 0.7)' // 언더파: 청록색
              : round.score === round.par 
                ? 'rgba(255, 205, 86, 0.7)' // 이븐파: 노란색
                : 'rgba(255, 99, 132, 0.7)' // 오버파: 분홍색
          ),
          yAxisID: 'y1',
        }
      ]
    };
  };

  // 라운드 스코어 차트 옵션
  const roundScoreChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '최근 라운드 성적'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw;
            if (context.datasetIndex === 1) { // 파 대비 데이터셋인 경우
              const sign = value < 0 ? '' : '+'; // 언더파는 마이너스, 오버파는 플러스
              return `${datasetLabel}: ${sign}${value}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '총 스코어'
        },
        reverse: true, // 골프 스코어는 낮을수록 좋음
        min: 65,
        max: 100
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '파 대비'
        },
        grid: {
          drawOnChartArea: false,
        }
      }
    }
  };

  // 기존 템플릿 데이터 구성
  const renderActionButtons = () => (
    <Grid container spacing={2} mt={3}>
      <Grid item xs={12} sm={4}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          sx={{ height: '100%', py: 2 }}
          onClick={() => navigate('/rounds/new')}
        >
          라운드 기록하기
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<BarChartIcon />}
          sx={{ height: '100%', py: 2 }}
          onClick={() => navigate('/stats/clubs')}
        >
          클럽별 분석
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          variant="contained"
          color="success"
          fullWidth
          startIcon={<EditIcon />}
          sx={{ height: '100%', py: 2 }}
        >
          목표 설정하기
        </Button>
      </Grid>
    </Grid>
  );

  // 최근 라운드 목록 표시
  const renderRoundHistory = () => (
    <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        최근 라운드 기록
      </Typography>
      
      {roundHistory.length === 0 ? (
        <Typography variant="body1" align="center" p={3} color="text.secondary">
          아직 등록된 라운드 기록이 없습니다.
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell>날짜</TableCell>
                <TableCell>코스</TableCell>
                <TableCell align="center">총점</TableCell>
                <TableCell align="center">파 대비</TableCell>
                <TableCell align="center">페어웨이 안착률</TableCell>
                <TableCell align="center">평균 퍼팅</TableCell>
                <TableCell align="center">상세보기</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roundHistory.map((round) => {
                const parDiff = round.score - round.par;
                return (
                  <TableRow 
                    key={round.id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => navigate(`/stats/rounds/${round.id}`)}
                  >
                    <TableCell>{round.date}</TableCell>
                    <TableCell>{round.courseName}</TableCell>
                    <TableCell align="center">{round.score}</TableCell>
                    <TableCell 
                      align="center"
                      sx={{ 
                        color: parDiff > 0 
                          ? 'primary.main' 
                          : parDiff < 0 
                            ? 'error.main' 
                            : 'text.primary',
                        fontWeight: 'bold'
                      }}
                    >
                      {parDiff > 0 ? `+${parDiff}` : parDiff}
                    </TableCell>
                    <TableCell align="center">{round.fairwayHitRate}%</TableCell>
                    <TableCell align="center">{round.puttsPerRound}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/stats/rounds/${round.id}`);
                        }}
                      >
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

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

  // 임시 데이터 (실제 API에서 가져온 값으로 대체 예정)
  const scoreAvg = stats?.avgScore || 85.3;
  const fairwayHitRate = stats?.fairwayHitRate || 64.2;
  const greenHitRate = stats?.greenHitRate || 52.8;
  const puttingAvg = stats?.puttsPerRound || 1.8;
  
  // 목표 데이터 (사용자 설정 값 또는 기본값)
  const handicapGoal = 10.0;
  const scoreGoal = 80.0;
  const greenHitGoal = 60.0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          골프 분석 대시보드
        </Typography>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>K</Avatar>
          <Box>
            <Typography variant="body1" fontWeight="bold">길골프</Typography>
            <Typography variant="body2" color="textSecondary">핸디캡: {stats?.handicapIndex || 12.5}</Typography>
          </Box>
        </Box>
      </Box>

      {/* 주요 지표 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 평균 스코어 */}
        <Grid item xs={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" color="textSecondary">평균 스코어</Typography>
            <Typography variant="h3" fontWeight="bold">{scoreAvg}</Typography>
            <StatTrend value="2.1지난 달 대비" up={false} />
          </Paper>
        </Grid>
        
        {/* 페어웨이 안착률 */}
        <Grid item xs={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" color="textSecondary">페어웨이 안착률</Typography>
            <Typography variant="h3" fontWeight="bold">{fairwayHitRate}%</Typography>
            <StatTrend value="3.5%지난 달 대비" up={true} />
          </Paper>
        </Grid>
        
        {/* 그린 적중률 */}
        <Grid item xs={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" color="textSecondary">그린 적중률</Typography>
            <Typography variant="h3" fontWeight="bold">{greenHitRate}%</Typography>
            <StatTrend value="1.2%지난 달 대비" up={true} />
          </Paper>
        </Grid>
        
        {/* 평균 퍼팅 */}
        <Grid item xs={6} md={3}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body1" color="textSecondary">평균 퍼팅</Typography>
            <Typography variant="h3" fontWeight="bold">{puttingAvg}</Typography>
            <StatTrend value="0.2지난 달 대비" up={false} />
          </Paper>
        </Grid>
      </Grid>

      {/* 최근 라운드 스코어 & 목표 현황 */}
      <Grid container spacing={3}>
        {/* 최근 라운드 스코어 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              최근 라운드 스코어
            </Typography>
            <ButtonGroup size="small" sx={{ mb: 2 }}>
              <Button 
                variant={roundHistoryFilter === '5' ? 'contained' : 'outlined'}
                onClick={() => setRoundHistoryFilter('5')}
              >
                5 라운드
              </Button>
              <Button 
                variant={roundHistoryFilter === '10' ? 'contained' : 'outlined'}
                onClick={() => setRoundHistoryFilter('10')}
              >
                10 라운드
              </Button>
              <Button 
                variant={roundHistoryFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setRoundHistoryFilter('all')}
              >
                전체
              </Button>
            </ButtonGroup>
            
            <Box height={250}>
              {roundHistory.length ? (
                <Bar 
                  data={roundScoreChartData()} 
                  options={roundScoreChartOptions}
                />
              ) : (
                <Box 
                  height="100%" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Typography color="textSecondary">
                    아직 라운드 기록이 없습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* 목표 현황 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              목표 현황
            </Typography>
            
            <GoalProgress 
              current={stats?.handicapIndex || 12.5} 
              target={handicapGoal} 
              label="핸디캡 10 달성" 
              icon="H"
            />
            
            <GoalProgress 
              current={scoreAvg} 
              target={scoreGoal} 
              label="평균 스코어 80 달성" 
              icon="S"
            />
            
            <GoalProgress 
              current={greenHitRate} 
              target={greenHitGoal} 
              label="그린 적중률 60% 달성" 
              icon="G"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* 추가: 액션 버튼들 */}
      {renderActionButtons()}
      
      {/* 추가: 최근 라운드 목록 */}
      {renderRoundHistory()}
    </Box>
  );
};

export default Stats; 