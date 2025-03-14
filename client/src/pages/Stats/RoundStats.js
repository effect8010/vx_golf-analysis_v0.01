import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Remove as RemoveIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon
} from '@mui/icons-material';

// API 서비스
import { getRound } from '../../services/roundService';

// 날씨 아이콘 컴포넌트
const WeatherIcon = ({ weather }) => {
  switch (weather) {
    case '맑음':
      return <SunnyIcon color="warning" />;
    case '흐림':
      return <CloudIcon color="action" />;
    case '비':
      return <RainIcon color="info" />;
    case '눈':
      return <SnowIcon color="primary" />;
    default:
      return <SunnyIcon color="warning" />;
  }
};

// 페어웨이 안착 여부 컴포넌트
const FairwayHit = ({ hit }) => {
  if (hit === 'O') {
    return <CheckIcon color="success" fontSize="small" />;
  } else if (hit === 'X') {
    return <CloseIcon color="error" fontSize="small" />;
  } else {
    return <RemoveIcon color="action" fontSize="small" />;
  }
};

// 스코어 셀 컴포넌트 (파 대비 색상 표시)
const ScoreCell = ({ score, par }) => {
  let bgColor = 'inherit';
  let textColor = 'inherit';
  
  if (score < par - 1) {
    // 이글 이상
    bgColor = 'rgba(255, 99, 71, 0.2)';
    textColor = 'tomato';
  } else if (score === par - 1) {
    // 버디
    bgColor = 'rgba(255, 0, 0, 0.1)';
    textColor = 'error.main';
  } else if (score === par) {
    // 파
    bgColor = 'inherit';
    textColor = 'inherit';
  } else if (score === par + 1) {
    // 보기
    bgColor = 'rgba(33, 150, 243, 0.1)';
    textColor = 'primary.main';
  } else if (score > par + 1) {
    // 더블보기 이상
    bgColor = 'rgba(0, 0, 255, 0.2)';
    textColor = 'blue';
  }
  
  return (
    <TableCell 
      align="center" 
      sx={{ 
        bgcolor: bgColor,
        color: textColor,
        fontWeight: 'bold'
      }}
    >
      {score}
    </TableCell>
  );
};

const RoundStats = () => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        setLoading(true);
        const response = await getRound(roundId);
        setRound(response.data);
      } catch (err) {
        console.error('라운드 데이터 로딩 에러:', err);
        setError('라운드 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (roundId) {
      fetchRoundData();
    }
  }, [roundId]);

  // 데모 데이터 (테스트용)
  useEffect(() => {
    if (!roundId || loading === false && !round) {
      // 테스트 데이터
      const testData = {
        id: 1,
        date: '2023.05.15',
        courseName: '파인크릭',
        weather: '맑음',
        windSpeed: '보통',
        totalScore: 82,
        totalPar: 72,
        parDiff: 10,
        fairwayHitRate: '6/14',
        greenHitRate: '8/18',
        totalPutts: 34,
        holes: [
          { hole: 1, par: 4, score: 5, putts: 2, fairwayHit: 'X' },
          { hole: 2, par: 5, score: 5, putts: 2, fairwayHit: 'O' },
          { hole: 3, par: 3, score: 5, putts: 3, fairwayHit: '-' },
          { hole: 4, par: 4, score: 4, putts: 2, fairwayHit: 'O' },
          { hole: 5, par: 4, score: 5, putts: 2, fairwayHit: 'X' },
          { hole: 6, par: 5, score: 4, putts: 1, fairwayHit: 'O' },
          { hole: 7, par: 3, score: 3, putts: 1, fairwayHit: '-' },
          { hole: 8, par: 4, score: 5, putts: 2, fairwayHit: 'O' },
          { hole: 9, par: 4, score: 5, putts: 2, fairwayHit: 'X' },
          { hole: 10, par: 4, score: 4, putts: 2, fairwayHit: 'O' },
          { hole: 11, par: 4, score: 5, putts: 2, fairwayHit: 'O' },
          { hole: 12, par: 5, score: 5, putts: 2, fairwayHit: 'X' },
          { hole: 13, par: 3, score: 4, putts: 2, fairwayHit: '-' },
          { hole: 14, par: 4, score: 6, putts: 3, fairwayHit: 'X' },
          { hole: 15, par: 4, score: 4, putts: 1, fairwayHit: 'O' },
          { hole: 16, par: 3, score: 3, putts: 1, fairwayHit: '-' },
          { hole: 17, par: 4, score: 5, putts: 2, fairwayHit: 'O' },
          { hole: 18, par: 5, score: 5, putts: 2, fairwayHit: 'O' }
        ]
      };
      setRound(testData);
      setLoading(false);
    }
  }, [roundId, round, loading]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 스코어별 통계 계산
  const calculateScoreStats = () => {
    if (!round || !round.holes) return {};
    
    const scoreStats = {
      eagles: 0,
      birdies: 0,
      pars: 0,
      bogeys: 0,
      doubleBogeys: 0,
      others: 0
    };
    
    round.holes.forEach(hole => {
      const diff = hole.score - hole.par;
      if (diff <= -2) {
        scoreStats.eagles++;
      } else if (diff === -1) {
        scoreStats.birdies++;
      } else if (diff === 0) {
        scoreStats.pars++;
      } else if (diff === 1) {
        scoreStats.bogeys++;
      } else if (diff === 2) {
        scoreStats.doubleBogeys++;
      } else {
        scoreStats.others++;
      }
    });
    
    return scoreStats;
  };

  // 아웃/인 스코어 및 퍼팅 계산
  const calculateOutInStats = () => {
    if (!round || !round.holes) return {};
    
    const frontNine = round.holes.slice(0, 9);
    const backNine = round.holes.slice(9, 18);
    
    const outScore = frontNine.reduce((sum, hole) => sum + hole.score, 0);
    const inScore = backNine.reduce((sum, hole) => sum + hole.score, 0);
    const outPutts = frontNine.reduce((sum, hole) => sum + hole.putts, 0);
    const inPutts = backNine.reduce((sum, hole) => sum + hole.putts, 0);
    const outPar = frontNine.reduce((sum, hole) => sum + hole.par, 0);
    const inPar = backNine.reduce((sum, hole) => sum + hole.par, 0);
    
    const outFairwayHits = frontNine.filter(hole => hole.fairwayHit === 'O').length;
    const outFairwayAttempts = frontNine.filter(hole => hole.fairwayHit !== '-').length;
    const inFairwayHits = backNine.filter(hole => hole.fairwayHit === 'O').length;
    const inFairwayAttempts = backNine.filter(hole => hole.fairwayHit !== '-').length;
    
    return {
      outScore,
      inScore,
      outPutts,
      inPutts,
      outPar,
      inPar,
      outFairwayStats: `${outFairwayHits}/${outFairwayAttempts}`,
      inFairwayStats: `${inFairwayHits}/${inFairwayAttempts}`
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

  const scoreStats = calculateScoreStats();
  const { outScore, inScore, outPutts, inPutts, outPar, inPar, outFairwayStats, inFairwayStats } = calculateOutInStats();

  return (
    <Box>
      {/* 헤더 */}
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
            라운드 상세
          </Typography>
        </Box>
      </Box>

      {/* 라운드 요약 정보 */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">날짜</Typography>
            <Typography variant="h6" fontWeight="bold">{round.date}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">코스</Typography>
            <Typography variant="h6" fontWeight="bold">{round.courseName}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">총점</Typography>
            <Typography variant="h6" fontWeight="bold">{round.totalScore}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">파 대비</Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold"
              color={round.parDiff > 0 ? 'primary.main' : round.parDiff < 0 ? 'error.main' : 'text.primary'}
            >
              {round.parDiff > 0 ? `+${round.parDiff}` : round.parDiff}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">날씨</Typography>
            <Box display="flex" alignItems="center">
              <WeatherIcon weather={round.weather} />
              <Typography variant="h6" fontWeight="bold" ml={1}>{round.weather}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="body2" color="text.secondary">중속</Typography>
            <Typography variant="h6" fontWeight="bold">{round.windSpeed}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 탭 메뉴 */}
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="스코어카드" />
          <Tab label="샷 분석" />
          <Tab label="라운드 통계" />
        </Tabs>
      </Paper>

      {/* 탭 내용 */}
      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            스코어카드
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell align="center">홀</TableCell>
                  {round.holes.slice(0, 9).map(hole => (
                    <TableCell key={`hole-front-${hole.hole}`} align="center">{hole.hole}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>OUT</TableCell>
                  {round.holes.slice(9, 18).map(hole => (
                    <TableCell key={`hole-back-${hole.hole}`} align="center">{hole.hole}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>IN</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* PAR 행 */}
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>PAR</TableCell>
                  {round.holes.slice(0, 9).map(hole => (
                    <TableCell key={`par-front-${hole.hole}`} align="center">{hole.par}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{outPar}</TableCell>
                  {round.holes.slice(9, 18).map(hole => (
                    <TableCell key={`par-back-${hole.hole}`} align="center">{hole.par}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{inPar}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{round.totalPar}</TableCell>
                </TableRow>
                
                {/* 스코어 행 */}
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>스코어</TableCell>
                  {round.holes.slice(0, 9).map(hole => (
                    <ScoreCell 
                      key={`score-front-${hole.hole}`}
                      score={hole.score}
                      par={hole.par}
                    />
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{outScore}</TableCell>
                  {round.holes.slice(9, 18).map(hole => (
                    <ScoreCell 
                      key={`score-back-${hole.hole}`}
                      score={hole.score}
                      par={hole.par}
                    />
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{inScore}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{round.totalScore}</TableCell>
                </TableRow>
                
                {/* 퍼팅 행 */}
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>퍼팅</TableCell>
                  {round.holes.slice(0, 9).map(hole => (
                    <TableCell key={`putts-front-${hole.hole}`} align="center">{hole.putts}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{outPutts}</TableCell>
                  {round.holes.slice(9, 18).map(hole => (
                    <TableCell key={`putts-back-${hole.hole}`} align="center">{hole.putts}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{inPutts}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{round.totalPutts}</TableCell>
                </TableRow>
                
                {/* 페어웨이 안착 여부 행 */}
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>페어웨이</TableCell>
                  {round.holes.slice(0, 9).map(hole => (
                    <TableCell key={`fairway-front-${hole.hole}`} align="center">
                      <FairwayHit hit={hole.fairwayHit} />
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{outFairwayStats}</TableCell>
                  {round.holes.slice(9, 18).map(hole => (
                    <TableCell key={`fairway-back-${hole.hole}`} align="center">
                      <FairwayHit hit={hole.fairwayHit} />
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{inFairwayStats}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{round.fairwayHitRate}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            샷 분석
          </Typography>
          <Typography variant="body1" align="center" p={5} color="text.secondary">
            현재 샷 분석 데이터가 준비 중입니다.
          </Typography>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            라운드 통계
          </Typography>
          
          <Grid container spacing={3}>
            {/* 스코어 유형 통계 */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    스코어 유형
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'rgba(255, 99, 71, 0.2)', borderRadius: 1 }}>
                        <Typography variant="h4" color="tomato" fontWeight="bold">
                          {scoreStats.eagles}
                        </Typography>
                        <Typography variant="body2">이글 이상</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'rgba(255, 0, 0, 0.1)', borderRadius: 1 }}>
                        <Typography variant="h4" color="error.main" fontWeight="bold">
                          {scoreStats.birdies}
                        </Typography>
                        <Typography variant="body2">버디</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="h4" fontWeight="bold">
                          {scoreStats.pars}
                        </Typography>
                        <Typography variant="body2">파</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {scoreStats.bogeys}
                        </Typography>
                        <Typography variant="body2">보기</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'rgba(0, 0, 255, 0.2)', borderRadius: 1 }}>
                        <Typography variant="h4" color="blue" fontWeight="bold">
                          {scoreStats.doubleBogeys}
                        </Typography>
                        <Typography variant="body2">더블보기</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'rgba(0, 0, 139, 0.2)', borderRadius: 1 }}>
                        <Typography variant="h4" color="darkblue" fontWeight="bold">
                          {scoreStats.others}
                        </Typography>
                        <Typography variant="body2">트리플 이상</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            {/* 홀 타입별 성적 */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    홀 타입별 성적
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">파3 홀:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      평균 {calculateParTypeAvg(3).toFixed(1)} 타
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">파4 홀:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      평균 {calculateParTypeAvg(4).toFixed(1)} 타
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">파5 홀:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      평균 {calculateParTypeAvg(5).toFixed(1)} 타
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">페어웨이 안착률:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {round.fairwayHitRate}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">평균 퍼팅:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {(round.totalPutts / 18).toFixed(1)} 퍼트/홀
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
  
  // 파 타입별 평균 계산 함수
  function calculateParTypeAvg(parType) {
    if (!round || !round.holes) return 0;
    
    const parTypeHoles = round.holes.filter(hole => hole.par === parType);
    if (parTypeHoles.length === 0) return 0;
    
    const totalScore = parTypeHoles.reduce((sum, hole) => sum + hole.score, 0);
    return totalScore / parTypeHoles.length;
  }
};

export default RoundStats; 