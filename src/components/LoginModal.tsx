import React, { useState } from 'react';
import { 
  Modal, 
  Box,
  Button, 
  Typography, 
  Paper, 
  Avatar, 
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Input
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  nextPage:string;
}

const LoginModal = ({ open, onClose, onLoginSuccess ,nextPage}: LoginModalProps) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('开始登录请求...'); // 添加调试日志
    setLoading(true);
    setError(null);

    try {
      console.log('发送登录请求到后端...', { userId, password });
      
      // 1. 确保使用正确的API端点
      const response = await apiClient.post('/auth/login', { // 注意移除了多余的 /api
        userId,
        password
      });

      console.log('登录响应:', response.data); // 添加响应日志
      

      const result = response.data;
      if(result.isLogin===false){
         setError(t('login.errorMsg'));
      }else {
        const token = result.token;
      // 2. 确保登录函数被正确调用
      login(token, result); // 保存登录状态
      
      // 3. 通知父组件登录成功
      onLoginSuccess?.(); 
      if(nextPage !== ''){
        navigate(nextPage);
      }
      // 4. 关闭模态框
      onClose(); 
      
      console.log('登录成功');
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('登录错误:', error); // 详细错误日志
      
      // 5. 改进错误处理
      let errorMessage = t('login.errorMsg2');
      
      if (error.response) {
        // 服务器返回了响应但状态码不在 2xx 范围内
        console.error('服务器响应错误:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('未收到服务器响应:', error.request);
        errorMessage = t('login.errorMsg3');
      } else {
        // 请求设置错误
        console.error('请求设置错误:', error.message);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 6, 
          borderRadius: 4,
          width: '100%',
          maxWidth: 400,
          mx: 2,
          position: 'relative',
          zIndex: 1300
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('login.login')}
          </Typography>
        </Box>
        <Box>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="username">{t('login.username')}</InputLabel>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">{t('login.password')}</InputLabel>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              sx={{ mb: 2 }}
            />
          </FormControl>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              borderRadius: 2,
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0'
              }
            }}
            disabled={loading || !userId || !password}
          >
            {loading ? t('login.logining') : t('login.login')}
          </Button>
          </form>
        </Box>
      </Paper>
    </Modal>
  );
};

export default LoginModal;