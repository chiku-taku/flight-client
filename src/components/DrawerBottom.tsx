/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import type { Flight, Passenger } from '@/types/flight';
import { format } from 'date-fns';
import { AddCircle, FlightLand, FlightTakeoff, RemoveCircle } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 邮箱格式校验正则表达式
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 手机号码格式校验正则表达式（支持中国大陆11位手机号）
const PHONE_REGEX = /^1[3-9]\d{9}$/;

interface Props {
  selectedDeparture: Flight | null;  // 去程航班
  selectedReturn: Flight | null;     // 返程航班
  isOpen: boolean;     // 返程航班
  onCancel: (cancleStatue: any) => void;
}

const DrawerBottom: React.FC<Props> = ({
  selectedDeparture,
  selectedReturn,
  isOpen,
  onCancel
}) => {
  const navigate = useNavigate();
  const [subError, setSubError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(isOpen);
  const { t } = useTranslation();
  const handleCancle = (cancleStatue: any) => {
    onCancel(cancleStatue);
    setOpen(false);
  };
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    handleCancle(true);
    setOpen(open);
  };
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState<Passenger[]>([{
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNo: '',
    seatType: 'economy',
    seatTypeReturn: 'economy'
  }]);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // 监听isOpen变化的副作用
  useEffect(() => {
    if (!isOpen) {
      // 重置乘客信息
      setPassengerCount(1);
      setPassengers([{
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idNo: '',
        seatType: 'economy',
        seatTypeReturn: 'economy'
      }]);
      setErrors({});
    }
  }, [isOpen]);

  // 监听乘客信息变化，验证表单和计算总价
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    let allValid = true;

    passengers.forEach((passenger, index) => {
      // 验证邮箱
      if (passenger.email && !EMAIL_REGEX.test(passenger.email)) {
        newErrors[`email-${index}`] = t('drawer.msg1');
        allValid = false;
      } else {
        delete newErrors[`email-${index}`];
      }

      // 验证手机号码
      if (passenger.phone && !PHONE_REGEX.test(passenger.phone)) {
        newErrors[`phone-${index}`] = t('drawer.msg2');
        allValid = false;
      } else {
        delete newErrors[`phone-${index}`];
      }

      // 验证必填字段
      if (!passenger.firstName || !passenger.lastName || !passenger.email || !passenger.phone || !passenger.idNo) {
        allValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(allValid && passengerCount >= 1 && passengerCount <= 5);
  }, [passengers, passengerCount]);

  // 添加乘客
  const addPassenger = () => {
    if (passengerCount < 5) {
      setPassengerCount(passengerCount + 1);
      setPassengers([...passengers, {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idNo: '',
        seatType: 'economy',
        seatTypeReturn: 'economy'
      }]);
    }
  };

  // 移除乘客
  const removePassenger = (index: number) => {
    if (passengerCount > 1) {
      const newPassengers = [...passengers];
      newPassengers.splice(index, 1);
      setPassengerCount(passengerCount - 1);
      setPassengers(newPassengers);

      // 更新错误信息
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        const errorIndex = parseInt(key.split('-')[1]);
        if (errorIndex === index) {
          delete newErrors[key];
        } else if (errorIndex > index) {
          const field = key.split('-')[0];
          newErrors[`${field}-${errorIndex - 1}`] = newErrors[key];
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  // 更新乘客信息
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  // 获取可选的座位类型
  const getAvailableSeatTypes = (flight: Flight | null) => {
    if (!flight) return ['economy', 'business', 'firstClass'];

    const seatTypes: ('economy' | 'business' | 'firstClass')[] = [];
    if (flight.availableeconomySeats > 0) seatTypes.push('economy');
    if (flight.availablebusinessSeats > 0) seatTypes.push('business');
    if (flight.availablefirstClassSeats > 0) seatTypes.push('firstClass');
    return seatTypes;
  };

  // 获取座位类型对应的价格
  const getSeatPrice = (flight: Flight | null, seatType: string) => {
    if (!flight) return 0;

    switch (seatType) {
      case 'economy':
        return flight.economyPrice;
      case 'business':
        return flight.businessPrice;
      case 'firstClass':
        return flight.firstClassPrice;
      default:
        return 0;
    }
  };

  // 计算总价
  const calculateTotalPrice = () => {
    if (!selectedDeparture) return 0;

    return passengers.reduce((total, passenger) => {
      const departurePrice = getSeatPrice(selectedDeparture, passenger.seatType);
      if (passenger.seatTypeReturn !== null) {
        const returnPrice = getSeatPrice(selectedReturn, passenger.seatTypeReturn);
        return total + departurePrice + returnPrice;
      } else {
        return total + departurePrice;
      }
    }, 0);
  };

  // 提交订单
  const handleSubmit = async () => {
    console.log('开始登录请求...'); // 添加调试日志
    setLoading(true);
    //setError(null);

    try {
      console.log('发送登录请求到后端...', { passengers, selectedDeparture, selectedReturn });
      const storedUser = localStorage.getItem('user');
      // 1. 确保使用正确的API端点
      const response = await apiClient.post('/booking/book', { // 注意移除了多余的 /api
        passengers,
        selectedDeparture,
        selectedReturn,
        storedUser
      });

      console.log('登录响应:', response.data); // 添加响应日志
      const isSuccess = response.data.success
      if (isSuccess) {
        navigate('/mybooking');
      } else {
        const errorMessage = t('drawer.msg3');
        setSubError(errorMessage);
      }
    } catch (error: any) {

      // 5. 改进错误处理
      const errorMessage = t('drawer.msg3');
      setSubError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderConfirmDrawerContent = () => {
    // 未选择航班时不显示抽屉内容
    if (!selectedDeparture) {
      return null;
    }
    console.log('飞机1' + selectedDeparture + '飞机2' + selectedReturn);
    toggleDrawer(isOpen);
    if (!selectedReturn) {
      console.log('单程');
      return (
        <div>
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">{t('drawer.msg4')}</h2>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 航班信息 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* 去程航班 */}
              <div>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                  {t('drawer.flightInformation')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FlightTakeoff color="primary" sx={{ fontSize: 24 }} />
                  <Box>
                    <Typography variant="body1">
                      {selectedDeparture?.airline || t('drawer.noSelected')} {selectedDeparture?.flightNumber || '---'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(
                        parseISO(selectedDeparture?.departureDatetime || '1970-01-01T00:00:00Z'),
                        'yyyy-MM-dd HH:mm'
                      )}
                      {t('drawer.from')} {selectedDeparture?.departureArrName || t('drawer.unkonw')} {t('drawer.fly')}
                    </Typography>
                  </Box>
                </Box>
                {/* 显示座位价格 */}
                {selectedDeparture && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span className="text-sm text-gray-500"> {t('drawer.economy')}:</span>
                      <span className="ml-2 font-medium">¥{selectedDeparture.economyPrice}</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span className="text-sm text-gray-500">{t('drawer.business')}:</span>
                      <span className="ml-2 font-medium">¥{selectedDeparture.businessPrice}</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span className="text-sm text-gray-500">{t('drawer.firstClass')}:</span>
                      <span className="ml-2 font-medium">¥{selectedDeparture.firstClassPrice}</span>
                    </Box>
                  </Box>
                )}
              </div>
            </div>
            {/* 乘客信息 */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              {t('drawer.passengerInfo')} ({passengerCount}/5)      [{passengerCount} {t('drawer.sPassenger')}]
            </Typography>
            {/* 乘客表单 */}
            {passengers.map((passenger: {
              seatTypeReturn: any; lastName: any; firstName: any; email: any; phone: any; idNo: any; seatType: any;
            }, index: number) => (
              <Box
                key={index}
                sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, mb: 1, position: 'relative' }}
              >
                <IconButton
                  aria-label={t('drawer.deletePassenger')}
                  onClick={() => removePassenger(index)}
                  sx={{ position: 'absolute', top: 8, right: 8, color: 'red' }}
                  disabled={passengerCount <= 1}
                >
                  <RemoveCircle />
                </IconButton>

                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {t('drawer.passenger')} {index + 1}
                </Typography>

                <Grid container spacing={1}>
                  <Grid>
                    <TextField
                      label={t('drawer.lastNmae')}
                      variant="outlined"
                      fullWidth
                      value={passenger.lastName}
                      onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'lastName', e.target.value)}
                      required
                      error={!!errors[`lastName-${index}`]}
                      helperText={errors[`lastName-${index}`]}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      label={t('drawer.firstName')}
                      variant="outlined"
                      fullWidth
                      value={passenger.firstName}
                      onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'firstName', e.target.value)}
                      required
                      error={!!errors[`firstName-${index}`]}
                      helperText={errors[`firstName-${index}`]}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      label={t('drawer.email')}
                      variant="outlined"
                      fullWidth
                      value={passenger.email}
                      onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'email', e.target.value)}
                      type="email"
                      required
                      error={!!errors[`email-${index}`]}
                      helperText={errors[`email-${index}`] || t('drawer.msg5')}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      label={t('drawer.phone')}
                      variant="outlined"
                      fullWidth
                      value={passenger.phone}
                      onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'phone', e.target.value)}
                      required
                      error={!!errors[`phone-${index}`]}
                      helperText={errors[`phone-${index}`] || t('drawer.msg6')}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      label={t('drawer.idNo')}
                      variant="outlined"
                      fullWidth
                      value={passenger.idNo}
                      onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'idNo', e.target.value)}
                      required
                      error={!!errors[`idNo-${index}`]}
                      helperText={errors[`idNo-${index}`]}
                    />
                  </Grid>
                  <Grid>
                    <FormControl fullWidth>
                      <InputLabel id="seat-type-label">{t('drawer.seatType')}</InputLabel>
                      <Select
                        labelId="seat-type-label"
                        id="seat-type"
                        value={passenger.seatType}
                        label={t('drawer.seatType')}
                        onChange={(e) => updatePassenger(index, 'seatType', e.target.value as 'economy' | 'business' | 'firstClass')}
                      >
                        {getAvailableSeatTypes(selectedDeparture).map(type => (
                          <MenuItem
                            key={type}
                            value={type}
                            disabled={
                              (type === 'economy' && selectedDeparture?.availableeconomySeats === 0) ||
                              (type === 'business' && selectedDeparture?.availablebusinessSeats === 0) ||
                              (type === 'firstClass' && selectedDeparture?.availablefirstClassSeats === 0)
                            }
                          >
                            {type === 'economy' ? t('drawer.economy') : type === 'business' ? t('drawer.business') : t('drawer.firstClass')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>


                </Grid>
                {selectedDeparture && (
                  <Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'left', mt: 0, p: 0, bgColor: 'gray.50', borderRadius: '4px', gap: 2, pt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        [{t('drawer.subtotal')}: ({passenger.seatType === 'economy' ? t('drawer.economy') : passenger.seatType === 'business' ? t('drawer.business') : t('drawer.firstClass')})
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ¥{getSeatPrice(selectedDeparture, passenger.seatType)}]
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Box>
            ))}

            {/* 添加乘客按钮 */}
            {passengerCount < 5 && (
              <Button
                variant="outlined"
                onClick={addPassenger}
                startIcon={<AddCircle />}
                sx={{ mb: 4 }}
              >
                {t('drawer.addPassenger')}
              </Button>
            )}

            {/* 价格总计 */}
            <Divider sx={{ my: 4 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pl: 4, pr: 4 }}>
              <Typography variant="h5" fontWeight="bold">{t('drawer.totalPrice')}</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">¥{calculateTotalPrice()}</Typography>
            </Box>
            {/* </Box> */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center', mt: 4, gap: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, width: '100%', maxWidth: 300 }}
                  onClick={handleSubmit}
                  disabled={!isValid}
                >
                  {t('drawer.button1')}
                </Button>
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                <Button
                  variant="outlined"
                  sx={{ mt: 3, width: '100%', maxWidth: 300 }}
                  onClick={() => handleCancle(true)}
                >
                  {t('drawer.button2')}
                </Button>
              </Typography>

            </Box>
          </div>
        </div>
      );
    }


    console.log('往返');
    return (
      <div>

        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">{t('drawer.msg4')}</h2>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 航班信息 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            {/* 去程航班 */}
            <div>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                {t('drawer.deaprture')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FlightTakeoff color="primary" sx={{ fontSize: 24 }} />
                <Box>
                  <Typography variant="body1">
                    {selectedDeparture?.airline || t('drawer.noSelected')} {selectedDeparture?.flightNumber || '---'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(
                      parseISO(selectedDeparture?.departureDatetime || '1970-01-01T00:00:00Z'),
                      'yyyy-MM-dd HH:mm'
                    )}
                    {t('drawer.from')} {selectedDeparture?.departureArrName || t('drawer.unkonw')} {t('drawer.fly')}
                  </Typography>
                </Box>
              </Box>
              {/* 显示座位价格 */}
              {selectedDeparture && (
                <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.economy')}:</span>
                    <span className="ml-2 font-medium">¥{selectedDeparture.economyPrice}</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.business')}:</span>
                    <span className="ml-2 font-medium">¥{selectedDeparture.businessPrice}</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.firstClass')}:</span>
                    <span className="ml-2 font-medium">¥{selectedDeparture.firstClassPrice}</span>
                  </Box>
                </Box>
              )}
            </div>

            {/* 返程航班 */}
            <div>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                {t('drawer.return')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FlightLand color="secondary" sx={{ fontSize: 24 }} />
                <Box>
                  <Typography variant="body1">
                    {selectedReturn?.airline || t('drawer.noSelected')} {selectedReturn?.flightNumber || '---'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(
                      parseISO(selectedReturn?.departureDatetime || '1970-01-01T00:00:00Z'),
                      'yyyy-MM-dd HH:mm'
                    )}
                    {t('drawer.from')} {selectedReturn?.departureArrName || t('drawer.unkonw')} {t('drawer.fly')}
                  </Typography>
                </Box>
              </Box>
              {/* 显示座位价格 */}
              {selectedReturn && (
                <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.economy')}:</span>
                    <span className="ml-2 font-medium">¥{selectedReturn.economyPrice}</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.business')}:</span>
                    <span className="ml-2 font-medium">¥{selectedReturn.businessPrice}</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="text-sm text-gray-500">{t('drawer.firstClass')}:</span>
                    <span className="ml-2 font-medium">¥{selectedReturn.firstClassPrice}</span>
                  </Box>
                </Box>
              )}
            </div>
          </div>

          {/* 乘客信息 */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            {t('drawer.passengerInfo')} ({passengerCount}/5)      [{passengerCount} {t('drawer.sPassenger')}]
          </Typography>

          {/* 乘客表单 */}
          {passengers.map((passenger: {
            seatTypeReturn: any; lastName: any; firstName: any; email: any; phone: any; idNo: any; seatType: any;
          }, index: number) => (
            <Box
              key={index}
              sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: 2, mb: 1, position: 'relative' }}
            >
              <IconButton
                aria-label={t('drawer.deletePassenger')}
                onClick={() => removePassenger(index)}
                sx={{ position: 'absolute', top: 8, right: 8, color: 'red' }}
                disabled={passengerCount <= 1}
              >
                <RemoveCircle />
              </IconButton>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                {t('drawer.passenger')} {index + 1}
              </Typography>

              <Grid container spacing={1}>
                <Grid>
                  <TextField
                    label={t('drawer.lastNmae')}
                    variant="outlined"
                    fullWidth
                    value={passenger.lastName}
                    onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'lastName', e.target.value)}
                    required
                    error={!!errors[`lastName-${index}`]}
                    helperText={errors[`lastName-${index}`]}
                  />
                </Grid>
                <Grid>
                  <TextField
                    label={t('drawer.firstName')}
                    variant="outlined"
                    fullWidth
                    value={passenger.firstName}
                    onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'firstName', e.target.value)}
                    required
                    error={!!errors[`firstName-${index}`]}
                    helperText={errors[`firstName-${index}`]}
                  />
                </Grid>
                <Grid>
                  <TextField
                    label={t('drawer.email')}
                    variant="outlined"
                    fullWidth
                    value={passenger.email}
                    onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'email', e.target.value)}
                    type="email"
                    required
                    error={!!errors[`email-${index}`]}
                    helperText={errors[`email-${index}`] || t('drawer.msg5')}
                  />
                </Grid>
                <Grid>
                  <TextField
                    label={t('drawer.phone')}
                    variant="outlined"
                    fullWidth
                    value={passenger.phone}
                    onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'phone', e.target.value)}
                    required
                    error={!!errors[`phone-${index}`]}
                    helperText={errors[`phone-${index}`] || t('drawer.msg6')}
                  />
                </Grid>
                <Grid>
                  <TextField
                    label={t('drawer.idNo')}
                    variant="outlined"
                    fullWidth
                    value={passenger.idNo}
                    onChange={(e: { target: { value: string; }; }) => updatePassenger(index, 'idNo', e.target.value)}
                    required
                    error={!!errors[`idNo-${index}`]}
                    helperText={errors[`idNo-${index}`]}
                  />
                </Grid>
                <Grid>
                  <FormControl fullWidth>
                    <InputLabel id="seat-type-label">{t('drawer.deaprtureseatType')}</InputLabel>
                    <Select
                      labelId="seat-type-label"
                      id="seat-type"
                      value={passenger.seatType}
                      label={t('drawer.deaprtureseatType')}
                      onChange={(e) => updatePassenger(index, 'seatType', e.target.value as 'economy' | 'business' | 'firstClass')}
                    >
                      {getAvailableSeatTypes(selectedDeparture).map(type => (
                        <MenuItem
                          key={type}
                          value={type}
                          disabled={
                            (type === 'economy' && selectedDeparture?.availableeconomySeats === 0) ||
                            (type === 'business' && selectedDeparture?.availablebusinessSeats === 0) ||
                            (type === 'firstClass' && selectedDeparture?.availablefirstClassSeats === 0)
                          }
                        >
                          {type === 'economy' ? t('drawer.economy') : type === 'business' ? t('drawer.business') : t('drawer.firstClass')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <FormControl fullWidth>
                    <InputLabel id="seat-type-label">{t('drawer.returnseatType')}</InputLabel>
                    <Select
                      labelId="seat-type-label"
                      id="seat-type"
                      value={passenger.seatTypeReturn}
                      label={t('drawer.returnseatType')}
                      onChange={(e) => updatePassenger(index, 'seatTypeReturn', e.target.value as 'economy' | 'business' | 'firstClass')}
                    >
                      {getAvailableSeatTypes(selectedReturn).map(type => (
                        <MenuItem
                          key={type}
                          value={type}
                          disabled={
                            (type === 'economy' && selectedReturn?.availableeconomySeats === 0) ||
                            (type === 'business' && selectedReturn?.availablebusinessSeats === 0) ||
                            (type === 'firstClass' && selectedReturn?.availablefirstClassSeats === 0)
                          }
                        >
                          {type === 'economy' ? t('drawer.economy') : type === 'business' ? t('drawer.business') : t('drawer.firstClass')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>


              </Grid>
              {selectedDeparture && selectedReturn && (
                <Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'left', mt: 0, p: 0, bgColor: 'gray.50', borderRadius: '4px', gap: 2, pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      [{t('drawer.to')}: {passenger.seatType === 'economy' ? t('drawer.economy') : passenger.seatType === 'business' ? t('drawer.business') : t('drawer.firstClass')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ¥{getSeatPrice(selectedDeparture, passenger.seatType)}]
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      [{t('drawer.back')}: {passenger.seatTypeReturn === 'economy' ? t('drawer.economy') : passenger.seatType === 'business' ? t('drawer.business') : t('drawer.firstClass')}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ¥{getSeatPrice(selectedReturn, passenger.seatTypeReturn)}]
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      [{t('drawer.subtotal')}:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ¥{getSeatPrice(selectedDeparture, passenger.seatType) + getSeatPrice(selectedReturn, passenger.seatTypeReturn)}]
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Box>
          ))}

          {/* 添加乘客按钮 */}
          {passengerCount < 5 && (
            <Button
              variant="outlined"
              onClick={addPassenger}
              startIcon={<AddCircle />}
              sx={{ mb: 4 }}
            >
              {t('drawer.addPassenger')}
            </Button>
          )}

          {/* 价格总计 */}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pl: 4, pr: 4 }}>
            <Typography variant="h5" fontWeight="bold">{t('drawer.totalPrice')}</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">¥{calculateTotalPrice()}</Typography>
          </Box>
          {/* </Box> */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center', mt: 4, gap: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, width: '100%', maxWidth: 300 }}
                onClick={handleSubmit}
                disabled={!isValid}
              >
                {t('drawer.button1')}
              </Button>
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              <Button
                variant="outlined"
                sx={{ mt: 3, width: '100%', maxWidth: 300 }}
                onClick={() => handleCancle(true)}
              >
                {t('drawer.button2')}
              </Button>
            </Typography>

          </Box>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
      >
        {renderConfirmDrawerContent()}
      </Drawer>
    </div>
  );
}

export default DrawerBottom;
