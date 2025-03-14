import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

// 사용자 정보를 표시하고 수정하는 컴포넌트
const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    handicap: '',
    targetHandicap: ''
  });

  useEffect(() => {
    if (user) {
      // 실제 API 호출 대신 사용자 정보를 직접 설정 (예시)
      setProfile({
        fullName: user.full_name || '사용자',
        email: user.email || 'user@example.com',
        username: user.username || 'username',
        handicap: user.handicap || 0,
        targetHandicap: user.target_handicap || 0,
        joinDate: user.join_date ? new Date(user.join_date).toLocaleDateString() : '알 수 없음',
        profileImage: user.profile_image || null
      });

      // 폼 데이터도 초기화
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        handicap: user.handicap || '',
        targetHandicap: user.target_handicap || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (editMode) {
      // 편집 모드 취소 시 원래 데이터로 복원
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
        handicap: profile.handicap,
        targetHandicap: profile.targetHandicap
      });
    }
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 실제 API 호출 구현 필요
      // const response = await updateUserProfile(user.id, formData);
      
      // 성공 시 프로필 업데이트 (예시)
      setTimeout(() => {
        setProfile(prev => ({
          ...prev,
          fullName: formData.fullName,
          email: formData.email,
          handicap: formData.handicap,
          targetHandicap: formData.targetHandicap
        }));
        
        setSuccess('프로필이 성공적으로 업데이트 되었습니다.');
        setEditMode(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('프로필 업데이트 에러:', err);
      setError(err.message || '프로필 업데이트에 실패했습니다.');
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        내 프로필
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        개인 정보 및 골프 통계를 관리하세요.
      </Typography>

      <Grid container spacing={3}>
        {/* 프로필 정보 카드 */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
            <Avatar
              src={profile.profileImage || '/static/images/avatar/default.jpg'}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h5">{profile.fullName}</Typography>
            <Typography variant="body1" color="text.secondary">
              @{profile.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              가입일: {profile.joinDate}
            </Typography>
            <Button
              variant="outlined"
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
              sx={{ mt: 2 }}
            >
              {editMode ? '편집 취소' : '프로필 편집'}
            </Button>
          </Paper>
        </Grid>

        {/* 프로필 편집 또는 정보 표시 */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            {editMode ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                  프로필 정보 수정
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="이름"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="이메일"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="현재 핸디캡"
                      name="handicap"
                      type="number"
                      InputProps={{ inputProps: { min: 0, max: 54, step: 0.1 } }}
                      value={formData.handicap}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="목표 핸디캡"
                      name="targetHandicap"
                      type="number"
                      InputProps={{ inputProps: { min: 0, max: 54, step: 0.1 } }}
                      value={formData.targetHandicap}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                    sx={{ mr: 1 }}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  프로필 정보
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      이름
                    </Typography>
                    <Typography variant="body1">{profile.fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      이메일
                    </Typography>
                    <Typography variant="body1">{profile.email}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      현재 핸디캡
                    </Typography>
                    <Typography variant="body1">{profile.handicap}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      목표 핸디캡
                    </Typography>
                    <Typography variant="body1">{profile.targetHandicap || '설정되지 않음'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* 추가 정보 카드 (예: 최근 라운드 요약) */}
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                최근 통계 요약
              </Typography>
              <Typography variant="body2" color="text.secondary">
                최근 라운드 기반 통계 데이터가 여기에 표시됩니다.
              </Typography>
              {/* 여기에 추가 통계 정보 표시 가능 */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 알림 메시지 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccess('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 