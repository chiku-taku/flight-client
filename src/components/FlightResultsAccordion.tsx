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
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import Drawer from '../components/DrawerBottom';
import { format, parseISO } from 'date-fns';
import { type Flight } from '../types/flight';
import { useTranslation } from 'react-i18next';

// 组件接收 flights 数组作为 props
interface Props {
  flights: Flight[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (flight: any, retflight: any) => void;
  isOpen: boolean;
}

const FlightResultsAccordion: React.FC<Props> = ({ flights, onSelect, isOpen }) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
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
  // 处理手风琴展开/折叠
  const handleChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFlightSelect = (flight: any) => {
    onSelect(flight, null);
    setSelectedFlight(flight);
    setIsOpenDrawer(isOpen);
  };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawerCancel = (cancelStatue: any) => {
    if (cancelStatue) {
      //console.log('抽屉已关闭');
      setIsOpenDrawer(false);
    }
  }

  return (
    <div className="flight-results-container">
      {flights.length > 0 ? (
        <div className="space-y-3">
          {flights.map((flight) => (
            <Accordion
              key={flight.flightId}
              expanded={expanded === flight.flightId}
              onChange={handleChange(flight.flightId)}
              elevation={2}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${flight.flightId}d-content`}
                id={`panel${flight.flightId}d-header`}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}
                >
                  {/* 航空公司和航班号 */}
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {flight.airline}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {flight.flightNumber}
                    </Typography>
                  </Box>

                  {/* 出发时间和机场 */}
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <div className="flex items-center">
                      <FlightTakeoffIcon color="primary" />
                      <div className="ml-2">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {format(parseISO(flight.departureDatetime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.departureArrName}
                        </Typography>
                      </div>
                    </div>
                  </Box>

                  {/* 时长和经停 */}
                  <Box sx={{ gridColumn: 'span 3', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {flight.duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {flight.stops === 0 ? t('flight.directflight') : `${flight.stops}t('flight.transit')`}
                    </Typography>
                  </Box>

                  {/* 到达时间和机场 */}
                  <Box sx={{ gridColumn: 'span 3' }}>
                    <div className="flex items-center justify-end">
                      <div className="mr-2 text-right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {format(parseISO(flight.destinationDatetime), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.destinationDesName}
                        </Typography>
                      </div>
                      <FlightLandIcon color="success" />
                    </div>
                  </Box>

                  {/* 价格 */}
                  <Box sx={{ gridColumn: 'span 1', textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ¥{flight.leasePrice}{t('flight.up')}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1rem',
                        '@media (min-width: 900px)': {
                          gridTemplateColumns: '2fr 1fr'
                        }
                      }}
                    >
                      {/* 详细信息 */}
                      <Box>
                        <Typography variant="body1" color="text.primary" className="mb-2">
                          <strong>{t('flight.flightInformation')}</strong>
                        </Typography>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.5rem',
                            mb: '1rem'
                          }}
                        >
                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.departureDate')}</Typography>
                            <Typography variant="body1">
                              {format(parseISO(flight.departureDatetime), 'yyyy-MM-dd')}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary">{t('flight.arrivalDate')}</Typography>
                            <Typography variant="body1">
                              {format(parseISO(flight.destinationDatetime), 'yyyy-MM-dd')}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" className="mb-1">
                          {t('flight.inFlightService')}
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {flight.amenitieslist.map((amenity, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </Box>

                      {/* 座位和预订按钮 */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" className="mb-1">
                          {t('flight.availableSeatsLeft')}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={flight.seatnum <= 5 ? "error" : "text.primary"}
                        >
                          {flight.seatnum} {t('flight.sSeat')}
                        </Typography>
                        <Button
                          variant="contained"
                          className="mt-4 w-full buttoncss"
                          startIcon={<FlightTakeoffIcon />}
                          onClick={() => handleFlightSelect(flight)}
                        >
                          {t('flight.bottonMsg')}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
          ))}
          {isOpenDrawer && <><Drawer selectedDeparture={selectedFlight} selectedReturn={null} isOpen={isOpenDrawer} onCancel={drawerCancel}></Drawer></>}
        </div>
        
      ) : (
        <div className="no-results-message">
          <Typography variant="body1" color="text.secondary" className="text-center py-8">
            {t('flight.errorMsg')}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default FlightResultsAccordion;