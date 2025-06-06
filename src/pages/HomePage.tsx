/* eslint-disable @typescript-eslint/no-explicit-any */
import './HomePage.css'

import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box, Divider, Chip, Typography } from '@mui/material';
import { fetchSingleFlights } from '../api/flightApi';
import { fetchRoundFlights } from '../api/flightApi';
import { type Flight } from '../types/flight';
import SingleWayBooking from '@/components/SingleWayBooking';
import RoundTripBooking from '../components/RoundTripBooking';
import FlightResultsAccordion from '../components/FlightResultsAccordion';
import FlightResultsAccordionRound from '../components/FlightResultsAccordionRound';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '../components/LoginModal';
import { useTranslation } from 'react-i18next';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [singleFlights, setSingleFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [departureFlights, setDepartureFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRoundSearched, setHasRoundSearched] = useState(false); // 标记是否已搜索——往返
  const [hasSingleSearched, setHasSingleSearched] = useState(false); // 标记是否已搜索——单程
  const [isOpen, setIsOpen] = useState(false); // 确认抽屉状态
  const [loginOpen, setLoginOpen] = useState(false);
  
    // 监听 Tab 切换，清除非当前 Tab 的结果
  useEffect(() => {
    if (tabValue === 0) {
      // 切换到单程 Tab，清除往返结果
      setDepartureFlights([]);
      setReturnFlights([]);
      setHasRoundSearched(false);
      setHasSingleSearched(false); // 标记未搜索
      setIsOpen(false);
    } else {
      // 切换到往返 Tab，清除单程结果
      setSingleFlights([]);
      setHasSingleSearched(false);
      setHasRoundSearched(false);
      setIsOpen(false);
    }
  }, [tabValue]); // 依赖 tabValue 变化
  // 处理搜索请求
  const handleRoundSearch = async (searchParams: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    setHasRoundSearched(true); // 标记已搜索
    setHasSingleSearched(false); // 标记已搜索

    try {
      const response = await fetchRoundFlights(searchParams);
      setDepartureFlights(response.departureFlights || []);
      setReturnFlights(response.returnFlights || []);
    } catch (error) {
      setErrorMessage(t('home.msg1'));
      console.error('API请求错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleSearch = async (searchParams: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    setHasRoundSearched(false); 
    setHasSingleSearched(true); // 标记已搜索

    try {
      const response = await fetchSingleFlights(searchParams);
      setSingleFlights(response || []);
    } catch (error) {
      setErrorMessage(t('home.msg1'));
      console.error('API请求错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //处理预订
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBook = (_departure: any, _returnFlight: any) => {
    console.log('登陆验证'+isAuthenticated);
    if (!isAuthenticated) {
      setLoginOpen(true); // 打开登录模态框
    } else {
      // 已登录，跳转到预订页面
      setIsOpen(true);
      console.log('预定页面跳转'+isAuthenticated);
    }
  };


  return (
    <div className="search-body">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: '#fffff',backgroundColor:'white',borderRadius:'20px' }}>
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => setTabValue(newValue)}
            aria-label={t('home.flightSearchType')}
            centered
            variant="fullWidth"
            indicatorColor="primary"
          >
            <Tab label={t('home.singleTrip')} {...a11yProps(0)} />
            <Tab label={t('home.roundTrip')} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={tabValue} index={0}>
          <SingleWayBooking onSearch={handleSingleSearch} />
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <RoundTripBooking onSearch={handleRoundSearch} /> {/* 传递搜索函数 */}
        </CustomTabPanel>
      </Box>

      <Divider sx={{ my: 4 }}>
        <Chip label={t('home.flightResult')} size="small" />
      </Divider>

      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-indicator text-center py-8">
          <Typography variant="body1">{t('home.searchingFlight')}</Typography>
        </div>
      )}

      {/* 错误提示 */}
      {errorMessage && (
        <div className="error-message text-center py-8">
          <Typography variant="body1" color="error">
            {errorMessage}
          </Typography>
        </div>
      )}

      {/* 合并条件：只有当两者都未搜索时才显示提示 */}
      {!(hasSingleSearched || hasRoundSearched) ? (
        <div className="initial-state-message text-center py-16">
          <Typography variant="h6" color="text.secondary">
            {t('home.toSearch')}
          </Typography>
        </div>
      ) : (
        <>
          {/* 单程结果 */}
          {hasSingleSearched && <FlightResultsAccordion 
            flights={singleFlights} 
            onSelect={handleBook} 
            isOpen = {isOpen}
          />}

          {/* 往返结果 */}
          {hasRoundSearched && <FlightResultsAccordionRound
            departureFlights={departureFlights}
            returnFlights={returnFlights}
            onSelect={handleBook} 
            //openDrawer = {isOpenDrawer}
            isOpen = {isOpen}
          />}
        </>
      )}
      {/* 登录模态框 */}
      <LoginModal 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        //onLoginSuccess={handleLoginSuccess} 
        nextPage = {''}
        onLoginSuccess={() => {
          console.log('登录成功');
          // 执行登录后的操作
        }}
      />


    </div>
  );
}