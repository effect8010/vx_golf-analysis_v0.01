import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  IconButton,
  Rating
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  Directions as DirectionsIcon,
  Star as StarIcon
} from '@mui/icons-material';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 대신 예시 데이터 사용
        // const response = await getCourseDetail(courseId);
        
        // 테스트용 더미 데이터
        setTimeout(() => {
          const dummyCourse = {
            course_id: parseInt(courseId),
            name: '써니밸리 컨트리클럽',
            region: '경기도',
            address: '경기도 용인시 처인구 남사읍 golf-ro 123',
            phone: '031-123-4567',
            website: 'https://www.sunnyvalleycc.co.kr',
            description: '써니밸리 CC는 아름다운 자연 환경 속에서 최고의 골프 경험을 제공합니다. 18홀 전체가 골퍼들에게 도전적이면서도 즐거운 경험을 선사합니다. 특히 물과 숲을 활용한 다양한 홀 구성이 특징적입니다.',
            holes: 18,
            par: 72,
            length: 6800,
            rating: 4.5,
            slope: 133,
            image_url: 'https://source.unsplash.com/random/?golf,course',
            facilities: ['클럽하우스', '드라이빙 레인지', '프로샵', '레스토랑', '사우나'],
            green_fee_weekday: 180000,
            green_fee_weekend: 260000,
            year_built: 2005,
            architect: '김한국',
            grass_type: '벤트그래스',
            caddy_fee: 140000
          };
          setCourse(dummyCourse);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('코스 상세 데이터 조회 오류:', err);
        setError('코스 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleBack = () => {
    navigate('/courses');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">코스 정보</Typography>
      </Box>

      {course && (
        <>
          <Card sx={{ mb: 3, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="300"
              image={course.image_url}
              alt={course.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" component="div" gutterBottom>
                  {course.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={course.rating} precision={0.5} readOnly />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {course.rating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {course.region} | {course.holes}홀 | 파 {course.par} | {course.length}야드
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>코스 소개</Typography>
                  <Typography variant="body1" paragraph>
                    {course.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>코스 정보</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography color="text.secondary" gutterBottom>주중 그린피</Typography>
                        <Typography variant="h6">{formatCurrency(course.green_fee_weekday)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography color="text.secondary" gutterBottom>주말 그린피</Typography>
                        <Typography variant="h6">{formatCurrency(course.green_fee_weekend)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography color="text.secondary" gutterBottom>캐디 피</Typography>
                        <Typography variant="h6">{formatCurrency(course.caddy_fee)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography color="text.secondary" gutterBottom>코스 설계자</Typography>
                        <Typography variant="h6">{course.architect}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>시설</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {course.facilities.map((facility, index) => (
                        <Chip key={index} label={facility} />
                      ))}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>연락처 및 정보</Typography>
                    <List disablePadding>
                      <ListItem disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="주소" 
                          secondary={course.address}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <PhoneIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="전화번호" 
                          secondary={course.phone}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ mb: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <WebsiteIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="웹사이트" 
                          secondary={course.website}
                          primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                    </List>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<DirectionsIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => window.open(`https://map.kakao.com/link/search/${course.address}`, '_blank')}
                    >
                      길찾기
                    </Button>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>추가 정보</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography color="text.secondary" variant="body2">개장연도</Typography>
                          <Typography variant="body1">{course.year_built}년</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography color="text.secondary" variant="body2">그린 잔디</Typography>
                          <Typography variant="body1">{course.grass_type}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography color="text.secondary" variant="body2">코스 난이도</Typography>
                          <Typography variant="body1">슬로프 {course.slope}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default CourseDetail; 