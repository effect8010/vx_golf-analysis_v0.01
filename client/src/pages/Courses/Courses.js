import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 8;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 대신 더미 데이터 사용
        // const response = await getCourses(page, coursesPerPage, searchTerm);
        
        // 더미 데이터
        setTimeout(() => {
          const dummyCourses = generateDummyCourses();
          setCourses(dummyCourses);
          setTotalPages(Math.ceil(dummyCourses.length / coursesPerPage));
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('코스 데이터 조회 오류:', err);
        setError('코스 데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page, searchTerm]);

  // 더미 코스 데이터 생성
  const generateDummyCourses = () => {
    const dummyCourses = [];
    const courseNames = [
      '써니밸리 CC', '레이크사이드 CC', '파인힐스 CC', '마운틴뷰 GC', '시티 GC',
      '오션뷰 CC', '그랜드 GC', '블루마운틴 CC', '이글 CC', '로얄 GC'
    ];
    
    const regions = ['서울/경기', '강원', '충청', '경상', '전라', '제주'];
    const holeTypes = [18, 27, 36];
    
    for (let i = 1; i <= 20; i++) {
      dummyCourses.push({
        course_id: i,
        name: courseNames[Math.floor(Math.random() * courseNames.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        address: `${regions[Math.floor(Math.random() * regions.length)]} 골프로 ${Math.floor(Math.random() * 100) + 1}번길 ${Math.floor(Math.random() * 100) + 1}`,
        holes: holeTypes[Math.floor(Math.random() * holeTypes.length)],
        par: 72,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 사이 평점
        image_url: `https://source.unsplash.com/featured/?golf,course&${i}`, // 랜덤 골프 코스 이미지
        played_count: Math.floor(Math.random() * 10)
      });
    }
    
    return dummyCourses;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleCreateCourse = () => {
    // 향후 코스 생성 페이지로 이동
    // navigate('/courses/new');
    alert('코스 추가 기능은 개발 중입니다.');
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCourses = filteredCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">골프 코스</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCourse}
        >
          코스 추가
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="코스명이나 지역으로 검색"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedCourses.map((course) => (
                <Grid item xs={12} sm={6} md={3} key={course.course_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => handleCourseClick(course.course_id)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.image_url}
                        alt={course.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                          {course.region} | {course.holes}홀 | 파 {course.par}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            방문: {course.played_count}회
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            ★ {course.rating}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}

              {paginatedCourses.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                      검색 결과가 없습니다.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {filteredCourses.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(filteredCourses.length / coursesPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Courses; 