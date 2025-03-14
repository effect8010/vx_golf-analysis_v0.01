import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  SportsGolf as SportsGolfIcon,
  Terrain as TerrainIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material';

import { logout } from '../../services/authService';

const navItems = [
  { title: '대시보드', path: '/', icon: <DashboardIcon /> },
  { title: '라운드 기록', path: '/rounds', icon: <SportsGolfIcon /> },
  { title: '골프 코스', path: '/courses', icon: <TerrainIcon /> },
  { title: '통계 분석', path: '/stats', icon: <BarChartIcon /> },
];

const Layout = ({ user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar
          src={user?.profileImage || '/static/images/avatar/default.jpg'}
          sx={{ width: 80, height: 80, mb: 2 }}
        />
        <Typography variant="h6">{user?.name || '게스트'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email || ''}
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.title}
            onClick={() => handleNavigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigate('/profile')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="프로필" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="로그아웃" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  골프 시뮬레이터 분석
                </Typography>
              </>
            ) : (
              <>
                <SportsGolfIcon sx={{ mr: 1 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ mr: 4 }}
                >
                  골프 시뮬레이터 분석
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.title}
                      color="inherit"
                      startIcon={item.icon}
                      onClick={() => handleNavigate(item.path)}
                      sx={{ mx: 1 }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </Box>
              </>
            )}

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="설정 메뉴">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.name || '사용자'}
                    src={user?.profileImage || '/static/images/avatar/default.jpg'}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  handleNavigate('/profile');
                }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography textAlign="center">프로필</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  handleCloseUserMenu();
                  handleLogout();
                }}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  <Typography textAlign="center">로그아웃</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px', // AppBar 높이
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 