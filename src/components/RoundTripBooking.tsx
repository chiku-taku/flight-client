import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchange, faMapMarker, faCalendar, faPlane } from '@fortawesome/free-solid-svg-icons';
import { type FlightSearchParams } from '../types/flight';
import { useTranslation } from 'react-i18next';

// 定义组件Props
interface Props {
  onSearch: (searchParams: FlightSearchParams) => void;
}

const RoundTripBooking: React.FC<Props> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FlightSearchParams>({
    departure: '北京',
    destination: '上海',
    departureDate: '2025-06-15',
    returnDate: '2025-06-17',
    cabin: 'economy',
  });

  // 交换出发地和目的地
  const handleSwapLocations = () => {
    setFormData(prevData => ({
      ...prevData,
      departure: prevData.destination,
      destination: prevData.departure,
    }));
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(formData); // 调用父组件的搜索函数
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 mb-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 出发地和目的地 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 relative">
            <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-2">{t('search.departure')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMapMarker} className="text-primary text-xl" />
              </div>
              <input
                type="text"
                id="departure"
                name="departure"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-custom"
                placeholder={t('search.city')}
              />
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="md:col-span-2 flex items-end justify-center">
            <button
              type="button"
              onClick={handleSwapLocations}
              className="w-12 h-12 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center shadow-md transition-custom hover:bg-primary active:scale-95"
            >
              <FontAwesomeIcon icon={faExchange} className="text-xl" />
            </button>
          </div>

          <div className="md:col-span-5 relative">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">{t('search.destination')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMapMarker} className="text-secondary text-xl" />
              </div>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-custom"
                placeholder={t('search.city')}
              />
            </div>
          </div>
        </div>

        {/* 日期选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">{t('search.departureDate')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faCalendar} className="text-primary" />
              </div>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-custom"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">{t('search.returnDate')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faCalendar} className="text-secondary" />
              </div>
              <input
                type="date"
                id="returnDate"
                name="returnDate"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-custom"
              />
            </div>
          </div>
        </div>
        {/* 搜索按钮 */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-6 rounded-lg shadow-lg transition-custom hover:shadow-xl hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-98"
          >
            <span className="text-lg font-semibold">{t('search.searchForFlights')}</span>
            <FontAwesomeIcon icon={faPlane} className="ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoundTripBooking;