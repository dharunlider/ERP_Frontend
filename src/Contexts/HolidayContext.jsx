import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../Axiosinstance';
import { useUser } from './Usercontext';

// Create Context
const HolidayContext = createContext();

// Custom Hook (optional, for convenience)
export const useHolidayContext = () => useContext(HolidayContext);

// Provider Component
export const HolidayProvider = ({ children }) => {


  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]);

  const fetchHolidays = () => {
    axios
      .get(`/public-holidays/${year}`)
      .then((res) => {
        const data = res.data;
        setHolidays(data);
        console.log("holidays", res.data);

      })
      .catch((err) => {
        console.error("Failed to fetch holidays", err);
      });
  };

  useEffect(() => {

    fetchHolidays();
 
  }, [year]);

  return (
    <HolidayContext.Provider value={{ holidays, year, setYear, refresh: fetchHolidays }}>
      {children}
    </HolidayContext.Provider>
  );
};
