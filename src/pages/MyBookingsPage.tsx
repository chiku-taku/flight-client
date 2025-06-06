/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import './MyBookingsPage.css'
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  IconButton,
  Collapse,
  Box,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import type { BookingFlights, BookingPassengers } from '@/types/flight';
import apiClient from '../api/apiClient';
import LoginModal from '../components/LoginModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';



interface BackendFlight {
  bookingId: string;
  flightNumber: string;
  departureTime: string;
  departureLocation: string;
  arrivalTime: string;
  arrivalLocation: string;
  amount: number;
  hasRoundTrip: boolean;
  returnbookingId?: string | null;
  returnflightNumber?: string | null;
  returndepartureTime?: string | null;
  returndepartureLocation?: string | null;
  returnarrivalTime?: string | null;
  returnarrivalLocation?: string | null;
  returnamount?: number | null;
  passengers: any[]; // 后端原始乘客数据结构
  returnpassengers?: any[] | null;
}

// 排序函数优化
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(order: Order, orderBy: Key) {
  return order === 'desc' ?
    (a: { [key in Key]: any }, b: { [key in Key]: any }) => descendingComparator(a, b, orderBy) :
    (a: { [key in Key]: any }, b: { [key in Key]: any }) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: BookingFlights[], comparator: (a: T, b: T) => number) {
  const stabilized = array.map((item, index) => [item, index] as [T, number]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  return stabilized.map((item) => item[0]);
}
// 数据转换函数
export function transformFlightData(backendData: any[]): BookingFlights[] {
  return backendData
    .filter((item): item is BackendFlight =>
      item && typeof item === 'object' && 'bookingId' in item && Array.isArray(item.passengers)
    )
    .map((flight: BackendFlight) => {
      // 主订单数据
      const mainData: Omit<BookingFlights, 'returnbookingId' | 'returnpassengers' | 'returnflightNumber' | 'returndepartureTime' | 'returndepartureLocation' | 'returnarrivalTime' | 'returnarrivalLocation' | 'returnamount'> = {
        bookingId: flight.bookingId,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime || '',
        departureLocation: flight.departureLocation || '',
        arrivalTime: flight.arrivalTime || '',
        arrivalLocation: flight.arrivalLocation || '',
        amount: flight.amount || 0,
        hasRoundTrip: flight.hasRoundTrip || false,
        passengers: flight.passengers.map((p): BookingPassengers => ({
          passengerId: p.passengerId || '',
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          email: p.email || '',
          phone: p.phone || '',
          idNo: p.idNo || '',
          seat: p.seat || '',
          price: p.price || 0,
        })),
      };

      // 返程数据（仅当 hasRoundTrip 为 true 且存在返程 ID 时）
      const returnData: Partial<Pick<BookingFlights, 'returnbookingId' | 'returnpassengers' | 'returnflightNumber' | 'returndepartureTime' | 'returndepartureLocation' | 'returnarrivalTime' | 'returnarrivalLocation' | 'returnamount'>> = {};

      if (flight.hasRoundTrip && flight.returnbookingId) {
        returnData.returnbookingId = flight.returnbookingId;
        returnData.returnflightNumber = flight.returnflightNumber || '';
        returnData.returndepartureTime = flight.returndepartureTime || '';
        returnData.returndepartureLocation = flight.returndepartureLocation || '';
        returnData.returnarrivalTime = flight.returnarrivalTime || '';
        returnData.returnarrivalLocation = flight.returnarrivalLocation || '';
        returnData.returnamount = flight.returnamount || 0;

        // 处理返程乘客
        if (Array.isArray(flight.returnpassengers) && flight.returnpassengers.length > 0) {
          returnData.returnpassengers = flight.returnpassengers.map((p): BookingPassengers => ({
            passengerId: p.passengerId || '',
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            email: p.email || '',
            phone: p.phone || '',
            idNo: p.idNo || '',
            seat: p.seat || '',
            price: p.price || 0,
          }));
        }
      }

      // 合并主订单和返程数据
      return { ...mainData, ...returnData };
    });
}
export default function EnhancedTable() {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('flightNumber'); // 初始排序字段改为航班号
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [mockFlights, setMockFlights] = useState<BookingFlights[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [reload, setReload] = useState(false); // 控制重新渲染的状态
  // 表格列定义优化
  const columns = [
    { id: 'blank', label: ' ', sortable: false },
    { id: 'flightNumber', label: t('bookings.flightNumber'), sortable: true },
    { id: 'departureTime', label: t('bookings.departureTime'), sortable: true },
    { id: 'departureLocation', label: t('bookings.departureLocation'), sortable: true },
    { id: 'arrivalTime', label: t('bookings.arrivalTime'), sortable: true },
    { id: 'arrivalLocation', label: t('bookings.arrivalLocation'), sortable: true },
    { id: 'amount', label: t('bookings.amount'), sortable: true },
    { id: 'hasRoundTrip', label: t('bookings.hasRoundTrip'), sortable: false }
  ];

  const returncolumns = [
    { id: 'blank', label: ' ', sortable: false },
    { id: 'returnflightNumber', label: t('bookings.flightNumber'), sortable: true },
    { id: 'returndepartureTime', label: t('bookings.departureTime'), sortable: true },
    { id: 'returndepartureLocation', label: t('bookings.departureLocation'), sortable: true },
    { id: 'returnarrivalTime', label: t('bookings.arrivalTime'), sortable: true },
    { id: 'returnarrivalLocation', label: t('bookings.arrivalLocation'), sortable: true },
    { id: 'returnamount', label: t('bookings.amount'), sortable: true },
    { id: 'returnhasRoundTrip', label: t('bookings.hasRoundTrip'), sortable: false }
  ];
  const fetchFlightOrders = async () => {
    if (!isAuthenticated) {
      console.log('未来登录' + isAuthenticated);
      setLoginOpen(true); // 打开登录模态框
      setReload((prev) => !prev); // 翻转状态触发重新渲染
    } else {
      console.log('已登录' + isAuthenticated);

      try {
        const storedUser = localStorage.getItem('user');
        // 1. 确保使用正确的API端点
        const response = await apiClient.post('/booking/getBookings', { // 注意移除了多余的 /api
          storedUser
        });

        console.log('登录响应:', response.data); // 添加响应日志
        const isSuccess = response.data.success
        if (isSuccess) {
          const formattedData: BookingFlights[] = transformFlightData(response.data.data.result);
          console.log('登录响应:', response.data.data.result); // 添加响应日志
          setMockFlights(formattedData);
          console.log('响应结果:', mockFlights); // 添加响应日志
        } else {
          const errorMessage = '查询失败，请重试';
          console.log(errorMessage);
        }
      } catch (error: any) {

        // 5. 改进错误处理
        const errorMessage = '预定失败，请重试';
        console.log(errorMessage);
      } finally {
        //setLoading(false);
      }
    }
  }

  // 行展开处理函数优化
  const handleExpandRow = (flightId: string) => {
    setExpandedRows(prev =>
      prev.includes(flightId) ?
        prev.filter(id => id !== flightId) :
        [...prev, flightId]
    );
  };

  // 排序处理函数优化
  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 分页处理函数
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  // 计算空行
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, mockFlights.length - page * rowsPerPage);

  useEffect(() => {
    console.log('调用');
    setReload(false);
    fetchFlightOrders();
  }, [reload]);


  function onLoginSuccess(): void {
    setReload((prev) => !prev); // 翻转状态触发重新渲染
  }

  return (mockFlights.length > 0 ? (<>
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
      <TableContainer className='table-container'>
        <Table aria-label={t('bookings.flightInformation')} size="small">
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody className='tableBody'>
            {stableSort(mockFlights, getComparator(order, orderBy as keyof BookingFlights))
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map((flight) => (
                <React.Fragment key={flight.bookingId}>
                  <TableRow
                    hover
                    //sx={{ cursor: 'pointer' }}
                    onClick={() => handleExpandRow(flight.bookingId)}
                  >
                    {/* 表格列内容 */}
                    {columns.map((column) => (
                      column.id === 'blank' ? (flight.hasRoundTrip ? (
                        <TableCell sx={{ padding: 1, minWidth: 48 }} rowSpan={2}>
                          <IconButton size="small">
                            {expandedRows.includes(flight.bookingId) ? (
                              <KeyboardArrowUp sx={{ color: '#2196F3' }} />
                            ) : (
                              <KeyboardArrowDown sx={{ color: '#2196F3' }} />
                            )}
                          </IconButton>
                        </TableCell>
                      ) :
                        (<TableCell sx={{ padding: 1, minWidth: 48 }}>
                          <IconButton size="small">
                            {expandedRows.includes(flight.bookingId) ? (
                              <KeyboardArrowUp sx={{ color: '#2196F3' }} />
                            ) : (
                              <KeyboardArrowDown sx={{ color: '#2196F3' }} />
                            )}
                          </IconButton>
                        </TableCell>)
                      ) : (
                        <TableCell
                          key={column.id}
                          align={column.id === 'amount' ? 'right' : 'left'}
                          sx={{ padding: 1, minWidth: column.id === 'flightNumber' ? 80 : 120 }}
                        >
                          {column.id === 'hasRoundTrip' ?
                            flight.hasRoundTrip ? t('bookings.toTrip') : t('bookings.singleTrip') :
                            column.id === 'amount' ? `¥${flight.amount}` :
                              flight[column.id as keyof BookingFlights]
                          }
                        </TableCell>
                      )
                    ))}
                  </TableRow>
                  {flight.hasRoundTrip ? (
                    <TableRow
                      hover
                      //sx={{ cursor: 'pointer' }}
                      onClick={() => handleExpandRow(flight.bookingId)}
                    >
                      {/* 表格列内容 */}
                      {returncolumns.map((column) => (
                        column.id === 'blank' ? (
                          null
                        ) : (
                          <TableCell
                            key={column.id}
                            align={column.id === 'returnamount' ? 'right' : 'left'}
                            sx={{ padding: 1, minWidth: column.id === 'flightNumber' ? 80 : 120 }}
                          >
                            {column.id === 'returnhasRoundTrip' ?
                              t('bookings.backTrip') :
                              column.id === 'returnamount' ? `¥${flight.amount}` :
                                flight[column.id as keyof BookingFlights]
                            }
                          </TableCell>
                        )
                      ))}
                    </TableRow>
                  ) : (null)}

                  {/* 展开的乘客信息 */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ padding: 0 }}>
                      <Collapse in={expandedRows.includes(flight.bookingId)} timeout="auto" unmountOnExit>
                        <Box sx={{
                          p: 1,
                          mt: 1,
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#f5f7fa',
                          borderRadius: 2,
                          marginLeft: 1,// 缩进显示
                          marginBottom: 1
                        }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              //gap: 1 
                            }}
                          >
                            {flight.hasRoundTrip ? t('bookings.toTrip') : null} {t('bookings.passengerInfo')} ({flight.passengers.length}{t('bookings.person')})
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Table size="small" sx={{ minWidth: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.name')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.email')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.phone')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.idNo')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.seatType')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500, textAlign: 'right' }}>{t('bookings.price')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {flight.passengers.map((passenger: { id: React.Key | null | undefined; lastName: any; firstName: any; email: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; phone: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; idNo: string; seat: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: number; }) => (
                                <TableRow key={passenger.id} sx={{
                                  '&:last-child td, &:last-child th': { border: 0 }
                                }}>
                                  <TableCell sx={{ p: 1 }}>
                                    {`${passenger.lastName} ${passenger.firstName}`}
                                  </TableCell>
                                  <TableCell sx={{ p: 1 }}>{passenger.email}</TableCell>
                                  <TableCell sx={{ p: 1 }}>{passenger.phone}</TableCell>
                                  <TableCell sx={{ p: 1 }}>
                                    {passenger.idNo.replace(/^(\d{4})\d{8}(\d{4})$/, '$1****$2')}
                                  </TableCell>
                                  <TableCell sx={{ p: 1 }}>
                                    <Chip
                                      label={passenger.seat}
                                      variant="outlined"
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ p: 1, textAlign: 'right', fontWeight: 500 }}>
                                    ¥{passenger.price.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  {flight.hasRoundTrip ? (<TableRow>
                    <TableCell colSpan={8} sx={{ padding: 0 }}>
                      <Collapse in={expandedRows.includes(flight.bookingId)} timeout="auto" unmountOnExit>
                        <Box sx={{
                          p: 1,
                          mt: 1,
                          border: '1px solid #e0e0e0',
                          backgroundColor: '#f5f7fa',
                          borderRadius: 2,
                          marginLeft: 1,// 缩进显示
                          marginBottom: 1
                        }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 500,
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              //gap: 1 
                            }}
                          >
                            {t('bookings.backTripPassengerInfo')} ({flight.returnpassengers.length}{t('bookings.person')})
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Table size="small" sx={{ minWidth: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.name')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.email')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.phone')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.idNo')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500 }}>{t('bookings.seatType')}</TableCell>
                                <TableCell sx={{ p: 1, fontWeight: 500, textAlign: 'right' }}>{t('bookings.price')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {flight.returnpassengers.map((passenger: { id: React.Key | null | undefined; lastName: any; firstName: any; email: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; phone: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; idNo: string; seat: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: number; }) => (
                                <TableRow key={passenger.id} sx={{
                                  '&:last-child td, &:last-child th': { border: 0 }
                                }}>
                                  <TableCell sx={{ p: 1 }}>
                                    {`${passenger.lastName} ${passenger.firstName}`}
                                  </TableCell>
                                  <TableCell sx={{ p: 1 }}>{passenger.email}</TableCell>
                                  <TableCell sx={{ p: 1 }}>{passenger.phone}</TableCell>
                                  <TableCell sx={{ p: 1 }}>
                                    {passenger.idNo.replace(/^(\d{4})\d{8}(\d{4})$/, '$1****$2')}
                                  </TableCell>
                                  <TableCell sx={{ p: 1 }}>
                                    <Chip
                                      label={passenger.seat}
                                      variant="outlined"
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ p: 1, textAlign: 'right', fontWeight: 500 }}>
                                    ¥{passenger.price.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>) : (null)}
                </React.Fragment>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={8} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        sx={{ mt: 3, padding: 2 }}
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={mockFlights.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      //ActionsComponent={TablePaginationActions}
      />
    </Paper>
    {/* 登录模态框 */}
    <LoginModal
      open={loginOpen}
      onClose={() => setLoginOpen(false)}
      //onLoginSuccess={handleLoginSuccess} 
      nextPage={''}
      onLoginSuccess={onLoginSuccess}
    // 执行登录后的操作

    /></>
  ) : (
    <>
      <Box textAlign="center">
        <Typography color='white'>
          {t('bookings.noBooking')}
        </Typography>
      </Box>
      {/* 登录模态框 */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        //onLoginSuccess={handleLoginSuccess} 
        nextPage={'/mybooking'}
        onLoginSuccess={onLoginSuccess}
      // 执行登录后的操作

      /></>));
}

// 表头组件优化
function EnhancedTableHead(props: {
  order: Order;
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
}) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();
  // 表格列定义优化
  const columns = [
    { id: 'blank', label: ' ', sortable: false },
    { id: 'flightNumber', label: t('bookings.flightNumber'), sortable: true },
    { id: 'departureTime', label: t('bookings.departureTime'), sortable: true },
    { id: 'departureLocation', label: t('bookings.departureLocation'), sortable: true },
    { id: 'arrivalTime', label: t('bookings.arrivalTime'), sortable: true },
    { id: 'arrivalLocation', label: t('bookings.arrivalLocation'), sortable: true },
    { id: 'amount', label: t('bookings.amount'), sortable: true },
    { id: 'hasRoundTrip', label: t('bookings.hasRoundTrip'), sortable: false }
  ];

  return (
    <TableHead className='tableHeader'>
      <TableRow>
        {columns.map(({ id, label, sortable }) => (
          <TableCell
            key={id}
            sortDirection={orderBy === id ? order : false}
            sx={{
              padding: 1.5,
              fontWeight: sortable ? 900 : 800,
              minWidth: id === 'flightNumber' ? 80 : 120,
              //color: orderBy === id ? 'blue' : 'white', 
              color: 'white'
            }}
          >
            {sortable ? (
              <TableSortLabel
                active={orderBy === id}
                direction={orderBy === id ? order : 'asc'}
                onClick={createSortHandler(id)}
                sx={{ textTransform: 'none', }}
              >
                <span className='sortSpan'>{label}</span>
              </TableSortLabel>
            ) : (
              <span>{label}</span>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}