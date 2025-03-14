import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Avatar
} from '@mui/material';
import {
  SportsGolf as SportsGolfIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

const BasicDashboard = ({ stats, trendStats, recentRounds, partners }) => {
  // 통계 데이터가 없는 경우 기본값 설정
  const userStats = stats?.data || {
    totalRounds: 0,
    avgScore: 0,
    bestScore: 0,
    avgDrivingDistance: 0,
    fairwayHitRate: 0,
    greenHitRate: 0,
    puttsPerRound: 0,
    birdieRate: 0,
    parRate: 0,
    bogeyRate: 0,
  };

  const rounds = recentRounds || [];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* 사용자 종합 통계 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="종합 통계" 
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SportsGolfIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">평균 스코어</Typography>
                    <Typography variant="h4">{userStats.avgScore?.toFixed(1) || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">베스트 스코어</Typography>
                    <Typography variant="h4">{userStats.bestScore || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">평균 드라이버 거리</Typography>
                    <Typography variant="h6">{userStats.avgDrivingDistance?.toFixed(1) || '-'} 야드</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">라운드 횟수</Typography>
                    <Typography variant="h6">{userStats.totalRounds || 0}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 최근 라운드 기록 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="최근 라운드" 
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TimelineIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              {rounds.length > 0 ? (
                <List>
                  {rounds.slice(0, 5).map((round, index) => (
                    <ListItem key={index} divider={index < Math.min(rounds.length, 5) - 1}>
                      <ListItemIcon>
                        <FlagIcon color={round.totalScore < 80 ? 'success' : round.totalScore < 90 ? 'primary' : 'warning'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${round.courseName || '코스 정보 없음'}`}
                        secondary={`${new Date(round.roundDate).toLocaleDateString('ko-KR')} / 스코어: ${round.totalScore}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="textSecondary">라운드 기록이 없습니다</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 퍼포먼스 통계 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="퍼포먼스 통계" 
              avatar={
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <CheckIcon />
                </Avatar>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">페어웨이 안착률</Typography>
                    <Typography variant="h6">{(userStats.fairwayHitRate * 100)?.toFixed(1) || 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">그린 적중률</Typography>
                    <Typography variant="h6">{(userStats.greenHitRate * 100)?.toFixed(1) || 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">평균 퍼팅</Typography>
                    <Typography variant="h6">{userStats.puttsPerRound?.toFixed(1) || '-'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="textSecondary">버디 확률</Typography>
                    <Typography variant="h6">{(userStats.birdieRate * 100)?.toFixed(1) || 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="textSecondary">파 확률</Typography>
                    <Typography variant="h6">{(userStats.parRate * 100)?.toFixed(1) || 0}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="textSecondary">보기 확률</Typography>
                    <Typography variant="h6">{(userStats.bogeyRate * 100)?.toFixed(1) || 0}%</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 동반자 통계 */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="함께 플레이한 동반자" 
              avatar={
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <SportsGolfIcon />
                </Avatar>
              }
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
    </Box>
  );
};

export default BasicDashboard; 