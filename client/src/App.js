import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';

// 레이아웃 컴포넌트
import Layout from './components/Layout/Layout';

// 페이지 컴포넌트
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFound from './pages/NotFound/NotFound';

// API 서비스
import { getCurrentUser } from './services/authService';

// 지연 로딩을 위한 컴포넌트 임포트
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const Rounds = React.lazy(() => import('./pages/Rounds/Rounds'));
const RoundDetail = React.lazy(() => import('./pages/Rounds/RoundDetail'));
const RoundForm = React.lazy(() => import('./pages/Rounds/RoundForm'));
const Courses = React.lazy(() => import('./pages/Courses/Courses'));
const CourseDetail = React.lazy(() => import('./pages/Courses/CourseDetail'));
const Stats = React.lazy(() => import('./pages/Stats/Stats'));
const ClubStats = React.lazy(() => import('./pages/Stats/ClubStats'));
const RoundStats = React.lazy(() => import('./pages/Stats/RoundStats'));

/**
 * 로딩 컴포넌트
 */
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

/**
 * 메인 애플리케이션 컴포넌트
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 초기 사용자 인증 상태 확인
    const checkAuthStatus = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('사용자 인증 확인 실패:', error);
        setError('인증 확인 중 오류가 발생했습니다. 다시 로그인해주세요.');
        
        // 로그인 페이지나 공개 페이지가 아닌 경우 리디렉션
        const publicPaths = ['/login', '/register'];
        if (!publicPaths.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate, location.pathname]);

  // 오류 메시지 닫기 핸들러
  const handleCloseError = () => {
    setError(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Routes>
        {/* 인증 페이지 */}
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        
        {/* 레이아웃이 포함된 보호된 페이지 */}
        <Route
          path="/"
          element={user ? <Layout user={user} /> : <Navigate to="/login" replace />}
        >
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Profile user={user} />
            </Suspense>
          } />
          <Route path="rounds" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Rounds />
            </Suspense>
          } />
          <Route path="rounds/new" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RoundForm />
            </Suspense>
          } />
          <Route path="rounds/edit/:roundId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RoundForm />
            </Suspense>
          } />
          <Route path="rounds/:roundId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RoundDetail />
            </Suspense>
          } />
          <Route path="courses" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Courses />
            </Suspense>
          } />
          <Route path="courses/:courseId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CourseDetail />
            </Suspense>
          } />
          <Route path="stats" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Stats />
            </Suspense>
          } />
          <Route path="stats/clubs" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ClubStats />
            </Suspense>
          } />
          <Route path="stats/rounds/:roundId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RoundStats />
            </Suspense>
          } />
        </Route>
        
        {/* 404 페이지 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; 