/* eslint-disable @typescript-eslint/no-explicit-any */
import './FlightResultsAccordion.css';
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import { format, parseISO } from 'date-fns';
import { type Flight } from '../types/flight';
import Drawer from '../components/DrawerBottom';
import { useTranslation } from 'react-i18next';

interface Props {
  departureFlights: Flight[];  // 去程航班
  returnFlights: Flight[];     // 返程航班
  onSelect: (flight: any, retflight: any) => void;
  isOpen: boolean;
}

const FlightResultsAccordion: React.FC<Props> = ({
  departureFlights,
  returnFlights,
  onSelect,
  isOpen
}) => {
  const [selectedDeparture, setSelectedDeparture] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const [expandedDeparture, setExpandedDeparture] = useState<string | null>(null);
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(isOpen); // 确认抽屉状态
  const { t } = useTranslation();
  // 监听isOpen变化的副作用
  React.useEffect(() => {
    if (isOpen) {
      // 抽屉打开时的逻辑（可选）
      console.log('抽屉已打开');
      setIsOpenDrawer(isOpen);
    } else {
      // 抽屉关闭时的逻辑（可选）
      console.log('抽屉已关闭');
      setIsOpenDrawer(isOpen);
    }
  }, [isOpen]); // 依赖项数组中包含isOpen，确保isOpen变化时触发

  const handleDepartureChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDeparture(isExpanded ? panel : null);
  };

  const handleReturnChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedReturn(isExpanded ? panel : null);
  };

  const canBook = selectedDeparture && selectedReturn;
  const totalPrice = (selectedDeparture?.leasePrice || 0) + (selectedReturn?.leasePrice || 0);

  const handleFlightSelect = (flight: any, retflight: any) => {
    onSelect(flight, retflight);
    console.log('isOpenDrawer的状态' + isOpenDrawer);
    console.log('isOpen的状态' + isOpen);
    setIsOpenDrawer(isOpen);
  };

  const drawerCancel = (cancelStatue: any) => {
    if (cancelStatue) {
      setIsOpenDrawer(false);
    }
  }
  return (
    <div className="flight-results-container">
      {/* 去程航班 */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" fontWeight="bold" className="text-primary">
          {t('flight.deaprture')}
        </Typography>
        <div className="space-y-3">
          {departureFlights.length > 0 ? (
            departureFlights.map((flight) => (
              <Accordion
                key={flight.flightId}
                expanded={expandedDeparture === flight.flightId}
                onChange={handleDepartureChange(flight.flightId)}
                elevation={2}
                sx={{
                  border: selectedDeparture?.flightId === flight.flightId ? '2px solid #1976d2' : 'none',
                  backgroundColor: selectedDeparture?.flightId === flight.flightId ? '#e8f4fd' : 'white',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* 复选框 + 左侧内容 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Checkbox
                      checked={selectedDeparture?.flightId === flight.flightId}
                      onChange={() => setSelectedDeparture(prev => prev?.flightId === flight.flightId ? null : flight)}
                      color="primary"
                      sx={{ marginRight: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {flight.airline}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flight.flightNumber}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 中间内容（时间、经停、价格） */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* 出发时间 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FlightTakeoffIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle1">{format(parseISO(flight.departureDatetime), 'HH:mm')}</Typography>
                        <Typography variant="body2" color="text.secondary">{flight.departureArrName}</Typography>
                      </Box>
                    </Box>

                    {/* 时长和经停 */}
                    <Box sx={{ textAlign: 'center', gap: 0.5, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="text.secondary">{flight.duration}</Typography>
                      <Typography variant="body2" color="text.secondary">{flight.stops === 0 ? t('flight.directflight') : `${flight.stops}t('flight.transit')`}</Typography>
                    </Box>

                    {/* 到达时间 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                      <Box>
                        <Typography variant="subtitle1">{format(parseISO(flight.destinationDatetime), 'HH:mm')}</Typography>
                        <Typography variant="body2" color="text.secondary">{flight.destinationDesName}</Typography>
                      </Box>
                      <FlightLandIcon color="success" />
                    </Box>

                    {/* 价格 */}
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ¥{flight.leasePrice}{t('flight.up')}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                    <CardContent sx={{ display: 'flex', gap: 6, '@media (max-width: 900px)': { flexDirection: 'column' } }}>
                      {/* 左侧详细信息 */}
                      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body1" color="text.primary" fontWeight="medium">{t('flight.flightInformation')}</Typography>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.departureDate')}</Typography>
                            <Typography variant="body1">{format(parseISO(flight.departureDatetime), 'yyyy-MM-dd')}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.arrivalDate')}</Typography>
                            <Typography variant="body1">{format(parseISO(flight.destinationDatetime), 'yyyy-MM-dd')}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">{t('flight.inFlightService')}</Typography>
                        <div className="flex flex-wrap gap-1.5">
                          {flight.amenitieslist.map((amenity) => (
                            <span key={amenity} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </Box>

                      {/* 右侧座位信息 */}
                      <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mt: 4,
                        '@media (min-width: 900px)': { mt: 0 }
                      }}>
                        <Typography variant="body2" color="text.secondary" mb={2}>{t('flight.availableSeatsLeft')}</Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={flight.seatnum <= 5 ? "error" : "text.primary"}
                        >
                          {flight.seatnum} {t('flight.sSeat')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">{t('flight.errorMsg')}</Typography>
            </Box>
          )}
        </div>
      </Box>

      {/* 返程航班（结构与去程类似，调整颜色和图标） */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" fontWeight="bold" className="text-primary">
          {t('flight.return')}
        </Typography>
        <div className="space-y-3">
          {returnFlights.length > 0 ? (
            returnFlights.map((flight) => (
              <Accordion
                key={flight.flightId}
                expanded={expandedReturn === flight.flightId}
                onChange={handleReturnChange(flight.flightId)}
                elevation={2}
                sx={{
                  border: selectedReturn?.flightId === flight.flightId ? '2px solid #64748b' : 'none', // 次色调边框
                  backgroundColor: selectedReturn?.flightId === flight.flightId ? '#f4f6f8' : 'white', // 次色调背景
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Checkbox
                      checked={selectedReturn?.flightId === flight.flightId}
                      onChange={() => setSelectedReturn(prev => prev?.flightId === flight.flightId ? null : flight)}
                      color="secondary"
                      sx={{ marginRight: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {flight.airline}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flight.flightNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FlightTakeoffIcon color="secondary" /> {/* 返程使用次色调图标 */}
                      <Box>
                        <Typography variant="subtitle1">{format(parseISO(flight.departureDatetime), 'HH:mm')}</Typography>
                        <Typography variant="body2" color="text.secondary">{flight.departureArrName}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', gap: 0.5, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="text.secondary">{flight.duration}</Typography>
                      <Typography variant="body2" color="text.secondary">{flight.stops === 0 ? t('flight.directflight') : `${flight.stops}t('flight.transit')`}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                      <Box>
                        <Typography variant="subtitle1">{format(parseISO(flight.destinationDatetime), 'HH:mm')}</Typography>
                        <Typography variant="body2" color="text.secondary">{flight.destinationDesName}</Typography>
                      </Box>
                      <FlightLandIcon color="success" />
                    </Box>

                    <Typography variant="h6" fontWeight="bold" color="secondary">
                      ¥{flight.leasePrice}{t('flight.up')}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                    <CardContent sx={{ display: 'flex', gap: 6, '@media (max-width: 900px)': { flexDirection: 'column' } }}>
                      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body1" color="text.secondary" fontWeight="medium">{t('flight.flightInformation')}</Typography>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.departureDate')}</Typography>
                            <Typography variant="body1">{format(parseISO(flight.departureDatetime), 'yyyy-MM-dd')}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.arrivalDate')}</Typography>
                            <Typography variant="body1">{format(parseISO(flight.destinationDatetime), 'yyyy-MM-dd')}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">{t('flight.inFlightService')}</Typography>
                        <div className="flex flex-wrap gap-1.5">
                          {flight.amenitieslist.map((amenity) => (
                            <span key={amenity} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </Box>

                      <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mt: 4,
                        '@media (min-width: 900px)': { mt: 0 }
                      }}>
                        <Typography variant="body2" color="text.secondary" mb={2}>{t('flight.availableSeatsLeft')}</Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={flight.seatnum <= 5 ? "error" : "text.primary"}
                        >
                          {flight.seatnum} {t('flight.sSeat')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">{t('flight.errorMsg')}</Typography>
            </Box>
          )}
        </div>
      </Box>

      {/* 预订按钮区域 */}
      <Box
        sx={{
          p: 4,
          bgColor: 'background.paper',
          borderRadius: 'lg',
          boxShadow: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          mt: 6,
          '@media (min-width: 900px)': {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {t('flight.totalPrice')}: <span className="text-primary ml-2">¥{totalPrice}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDeparture?.airline} {selectedDeparture?.flightNumber} + {selectedReturn?.airline} {selectedReturn?.flightNumber}
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{ width: '100%', '@media (min-width: 900px)': { width: 'auto' } }}
          startIcon={<FlightTakeoffIcon />}
          disabled={!canBook}
          onClick={() => handleFlightSelect(selectedDeparture, selectedReturn)}
        >
          {canBook ? t('flight.bottonMsg') : t('flight.bottonMsg1')}
        </Button>
      </Box>
      {isOpenDrawer && <><Drawer selectedDeparture={selectedDeparture} selectedReturn={selectedReturn} isOpen={isOpenDrawer} onCancel={drawerCancel}></Drawer></>}
    </div>
  );
};

export default FlightResultsAccordion;