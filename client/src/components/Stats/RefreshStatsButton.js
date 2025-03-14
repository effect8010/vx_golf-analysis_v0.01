import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { refreshAllStats } from '../../services/statsService';

/**
 * 통계 데이터 새로고침 버튼 컴포넌트
 * 
 * @param {Object} props
 * @param {Function} props.onRefresh - 새로고침 후 호출될 콜백 함수
 * @param {string} props.userId - 사용자 ID (기본값: 현재 로그인한 사용자)
 */
const RefreshStatsButton = ({ onRefresh, userId, size = 'medium', ...props }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshAllStats(userId);
      
      setSnackbar({
        open: true,
        message: '통계 데이터가 새로고침되었습니다.',
        severity: 'success'
      });
      
      // 상위 컴포넌트에 새로고침 완료 알림
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('통계 새로고침 실패:', error);
      setSnackbar({
        open: true,
        message: '통계 데이터 새로고침에 실패했습니다.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={handleRefresh}
        disabled={loading}
        size={size}
        {...props}
      >
        {loading ? '새로고침 중...' : '통계 새로고침'}
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </>
  );
};

export default RefreshStatsButton; 