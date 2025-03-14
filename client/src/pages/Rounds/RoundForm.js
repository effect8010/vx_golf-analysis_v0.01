import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';

// 라운드 데이터 서비스 함수 import 필요
// import { getRound, createRound, updateRound } from '../../services/roundService';

const RoundForm = () => {
  const { roundId } = useParams();
  const isEditMode = !!roundId;
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    course_name: '',
    first_course_name: '',
    first_course_number: 1,
    second_course_name: '',
    second_course_number: 1,
    round_date: new Date(),
    round_time: new Date(),
    weather_condition: '맑음',
    temperature: 20,
    total_score: 72,
    fairway_hit: 10,
    green_hit: 12,
    putting: 36,
    notes: ''
  });

  // 코스 옵션 상태
  const [courseOptions, setCourseOptions] = useState([
    '써니밸리 CC', '레이크사이드 CC', '파인힐스 CC', '마운틴뷰 GC', '시티 GC'
  ]);
  
  const [courseNameOptions, setCourseNameOptions] = useState([
    '동코스', '서코스', '남코스', '북코스', '레이크코스', '마운틴코스', '밸리코스'
  ]);

  const weatherOptions = ['맑음', '흐림', '비', '눈', '바람'];

  // 라운드 데이터 불러오기 (수정 모드인 경우)
  useEffect(() => {
    if (isEditMode) {
      const fetchRound = async () => {
        try {
          // 실제 API 호출 대신 예시 데이터 사용
          // const roundData = await getRound(roundId);
          
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

            // 날짜와 시간 객체로 변환
            const roundDate = new Date(dummyRound.round_date);
            const [hours, minutes] = dummyRound.round_time.split(':');
            const roundTime = new Date();
            roundTime.setHours(parseInt(hours), parseInt(minutes));

            setFormData({
              ...dummyRound,
              round_date: roundDate,
              round_time: roundTime
            });
            setLoading(false);
          }, 800);
        } catch (err) {
          console.error('라운드 데이터 조회 오류:', err);
          setError('라운드 데이터를 불러오는 중 오류가 발생했습니다.');
          setLoading(false);
        }
      };

      fetchRound();
    }
  }, [roundId, isEditMode]);

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 폼 데이터 변환
      const submitData = {
        ...formData,
        round_date: formData.round_date.toISOString().split('T')[0],
        round_time: `${formData.round_time.getHours().toString().padStart(2, '0')}:${formData.round_time.getMinutes().toString().padStart(2, '0')}`
      };

      if (isEditMode) {
        // 실제 API 호출 대신 예시
        // await updateRound(roundId, submitData);
        console.log('라운드 수정:', submitData);
      } else {
        // 실제 API 호출 대신 예시
        // const newRound = await createRound(submitData);
        console.log('라운드 생성:', submitData);
      }

      // 성공 처리
      setSuccess(true);
      setTimeout(() => {
        navigate('/rounds');
      }, 1500);
    } catch (err) {
      console.error('라운드 저장 오류:', err);
      setError('라운드 정보를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 입력 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 다음 단계로 이동
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // 이전 단계로 이동
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // 날씨 아이콘 표시
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

  // 폼 단계 정의
  const steps = ['기본 정보', '코스 상세', '스코어 및 통계'];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/rounds')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{isEditMode ? '라운드 수정' : '새 라운드 생성'}</Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                라운드 정보가 성공적으로 저장되었습니다. 목록 페이지로 이동합니다.
              </Alert>
            )}

            {/* 단계 1: 기본 정보 */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>골프 코스</InputLabel>
                    <Select
                      name="course_name"
                      value={formData.course_name}
                      onChange={handleChange}
                      label="골프 코스"
                      required
                    >
                      {courseOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                    <DatePicker
                      label="라운드 날짜"
                      value={formData.round_date}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, round_date: newValue }))}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
                    <TimePicker
                      label="티오프 시간"
                      value={formData.round_time}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, round_time: newValue }))}
                      slotProps={{ textField: { fullWidth: true, required: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>날씨 상태</InputLabel>
                    <Select
                      name="weather_condition"
                      value={formData.weather_condition}
                      onChange={handleChange}
                      label="날씨 상태"
                    >
                      {weatherOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {getWeatherIcon(option)} {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="기온 (°C)"
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: -20, max: 50 } }}
                  />
                </Grid>
              </Grid>
            )}

            {/* 단계 2: 코스 상세 */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    전반 코스
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth>
                    <InputLabel>코스명</InputLabel>
                    <Select
                      name="first_course_name"
                      value={formData.first_course_name}
                      onChange={handleChange}
                      label="코스명"
                      required
                    >
                      {courseNameOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>코스번호</InputLabel>
                    <Select
                      name="first_course_number"
                      value={formData.first_course_number}
                      onChange={handleChange}
                      label="코스번호"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    후반 코스
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth>
                    <InputLabel>코스명</InputLabel>
                    <Select
                      name="second_course_name"
                      value={formData.second_course_name}
                      onChange={handleChange}
                      label="코스명"
                      required
                    >
                      {courseNameOptions.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>코스번호</InputLabel>
                    <Select
                      name="second_course_number"
                      value={formData.second_course_number}
                      onChange={handleChange}
                      label="코스번호"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* 단계 3: 스코어 및 통계 */}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    스코어 및 통계 정보
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        총 스코어
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        name="total_score"
                        value={formData.total_score}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 30, max: 150 } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        페어웨이 안착
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        name="fairway_hit"
                        value={formData.fairway_hit}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0, max: 14 } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        그린 적중
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        name="green_hit"
                        value={formData.green_hit}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0, max: 18 } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        퍼팅 수
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        name="putting"
                        value={formData.putting}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 10, max: 72 } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="라운드 메모"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                이전
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? '저장 중...' : isEditMode ? '라운드 수정' : '라운드 생성'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    다음
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default RoundForm; 