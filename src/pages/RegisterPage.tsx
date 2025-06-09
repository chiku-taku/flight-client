import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/flightApi';
import { useTranslation } from 'react-i18next';
import LoginModal from '../components/LoginModal';

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  //FormHelperText,
  MenuItem,
  Alert,
  Collapse,
  type SnackbarCloseReason,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Badge,
  Phone,
  Public,
  Fingerprint
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    idNo: ''
  });

  const [errors, setErrors] = useState({
    userId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: '',
    phone: '',
    idNo: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const countries = [
    { value: 'CN', label: t('register.china') },
    { value: 'US', label: t('register.america') },
    { value: 'JP', label: t('register.japan') },
    { value: 'KR', label: t('register.korea') },
    { value: 'UK', label: t('register.england') },
    { value: 'FR', label: t('register.france') },
    { value: 'DE', label: t('register.germany') },
    { value: 'CA', label: t('register.canada') },
    { value: 'AU', label: t('register.australia') },
    { value: 'RU', label: t('register.russia') },
    { value: 'IN', label: t('register.india') },
    { value: 'BR', label: t('register.brazil') },
  ];

  const validateField = (name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
      error = t('register.errorMsg1');
    } else {
      switch (name) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = t('register.errorMsg2');
          }
          break;
        case 'phone':
          if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/.test(value)) {
            error = t('register.errorMsg3');
          }
          break;
        case 'password':
          if (value.length < 6) {
            error = t('register.errorMsg4');
          }
          break;
        case 'idNo':
          if (!/^[A-Za-z0-9]{8,20}$/.test(value)) {
            error = t('register.errorMsg5');
          }
          break;
        default:
          break;
      }
    }

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 实时验证
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {
      userId: validateField('userId', formData.userId),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      country: validateField('country', formData.country),
      phone: validateField('phone', formData.phone),
      idNo: validateField('idNo', formData.idNo)
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError(t('register.errorMsg6'));
      return;
    }

    setLoading(true);


    try {
      console.log('前端参数' + formData);
      const response = await register(formData);
      setSuccess(t('register.errorMsg7'));
      console.log(response);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setLoading(false);
      setError(error.response?.data?.message || t('register.errorMsg8'));
      console.error('API请求错误:', error);
    } finally {
      setLoading(false);
    }
  };
  //处理预订
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onLogin = () => {
    console.log('登陆验证' + isAuthenticated);
    if (!isAuthenticated) {
      setLoginOpen(true); // 打开登录模态框
    } else {
      setOpen(true);
      // 已登录，提示
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>

      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );


  return (
    <Container sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f5f7fa 0%,rgb(255, 255, 255) 100%)' }}>
        <Grid container justifyContent="center" mb={3}>
          <Grid>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold" gutterBottom>
              {t('register.createAccount')}
            </Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center">
              {t('register.joinUs')}
            </Typography>
          </Grid>
        </Grid>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Collapse>

        <Collapse in={!!success}>
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        </Collapse>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 第一行：用户ID和邮箱 */}
            <Grid>
              <FormControl fullWidth error={!!errors.userId}>
                <TextField
                  label={t('register.userId')}
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  error={!!errors.userId}
                  helperText={errors.userId}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={!!errors.email}>
                <TextField
                  label={t('register.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            {/* 第二行：名字和姓氏 */}
            <Grid>
              <FormControl fullWidth error={!!errors.firstName}>
                <TextField
                  label={t('register.firstName')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={!!errors.lastName}>
                <TextField
                  label={t('register.lastNmae')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            {/* 第三行：国家和电话 */}
            <Grid>
              <FormControl fullWidth error={!!errors.country} required>
                <TextField
                  select
                  label={t('register.city')}
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={!!errors.country}
                  helperText={errors.country}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Public />
                      </InputAdornment>
                    ),
                  }}
                >
                  {countries.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={!!errors.phone}>
                <TextField
                  label={t('register.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            {/* 第四行：密码和身份证号 */}
            <Grid>
              <FormControl fullWidth error={!!errors.password}>
                <TextField
                  label={t('register.password')}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>

            <Grid>
              <FormControl fullWidth error={!!errors.idNo}>
                <TextField
                  label={t('register.idNo')}
                  name="idNo"
                  value={formData.idNo}
                  onChange={handleChange}
                  error={!!errors.idNo}
                  helperText={errors.idNo}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fingerprint />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 4,
              py: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0b3d91 100%)',
                boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
              },
            }}
          >
            {loading ? t('register.registering') : t('register.toRegister')}
          </Button>

          <Typography variant="body2" color="textSecondary" align="center" mt={2}>
            {t('register.hasAccount')}
            <Button
              color="primary"
              size="small"
              sx={{ ml: 1, textTransform: 'none' }}
              onClick={onLogin}
            >
              {t('register.toLogin')}
            </Button>
          </Typography>
        </form>
      </Paper>
      {/* 登录模态框 */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        //onLoginSuccess={handleLoginSuccess} 
        nextPage={''}
        onLoginSuccess={() => {
          console.log('登录成功');
          // 执行登录后的操作
        }} />
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={t('register.msg')}
        action={action}
      />
    </Container>
  );
};

export default RegisterPage;