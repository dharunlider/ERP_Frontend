import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../Axiosinstance';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => {
    // Check if userId exists in localStorage and is valid
    // const savedUserId = localStorage.getItem('userId');
    const savedUserId = sessionStorage.getItem('userId');
    return savedUserId && savedUserId !== 'undefined' ? JSON.parse(savedUserId) : null;
  });

  const [authorities, setAuthorities] = useState(() => {
    const saved = sessionStorage.getItem('authorities');
    return saved && saved !== 'undefined' ? JSON.parse(saved) : [];
  });

  const [featurePermissions, setFeaturePermissions] = useState(() => {
    // Check if featurePermissions exist in localStorage and are valid
    const savedPermissions = sessionStorage.getItem('featurePermissions');
    return savedPermissions && savedPermissions !== 'undefined' ? JSON.parse(savedPermissions) : [];
  });

  const [role, setRole] = useState(() => {
    const savedRole = sessionStorage.getItem('role');
    return savedRole && savedRole !== 'undefined' ? JSON.parse(savedRole) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {

    try {
      // First, fetch the base user object to check userType
      const baseRes = await axios.get('user/me'); // assuming this gives you `userType`
      const baseUser = baseRes.data;

      const userType = baseUser.userType; // "staff" or "user"
      console.log(userType, "userType");
      let userDetails;
      let role = baseUser.role;
      let permissions = [];

      setAuthorities(baseUser.authorities || []);
      sessionStorage.setItem('authorities', JSON.stringify(baseUser.authorities || []));

      if (userType === 'STAFF') {
        const staffRes = await axios.get('/staff/me');
        console.log(staffRes.data.user.referenceId, "staffRes.data")
        userDetails = staffRes.data;
        role = userDetails.role?.name;
        permissions = userDetails.role?.featurePermissions || [];
        setUserId(userDetails.user.referenceId);
        console.log(userType, "i am called");
        sessionStorage.setItem('userId', JSON.stringify(userDetails.user.referenceId));
      } else {
        console.log(baseUser, "baseuser")
        const userRes = await axios.get(`/user/${baseUser.id}`);
        userDetails = userRes.data;
        role = userDetails.role;
        permissions = userDetails.featurePermissions || [];
        setUserId(userDetails.referenceId);
        console.log(userType, "2 i am called");
        sessionStorage.setItem('userId', JSON.stringify(userDetails.referenceId));
      }

      setFeaturePermissions(permissions);
      setRole(role);


      sessionStorage.setItem('featurePermissions', JSON.stringify(permissions));
      sessionStorage.setItem('role', JSON.stringify(role));
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user');
    }
  };



  // useEffect(() => {
  //   const savedUserId = sessionStorage.getItem("userId");
  //   if (savedUserId && savedUserId !== "undefined") {
  //     fetchUser();
  //   }
  // }, []);


  useEffect(() => {
    if (role) {
      sessionStorage.setItem('role', JSON.stringify(role));
    }
  }, [role]);

  useEffect(() => {
    const savedUserId = sessionStorage.getItem("userId");
    const hasJwtCookie = document.cookie.includes('accessToken=');

    if (!savedUserId && hasJwtCookie) {
      // JWT exists but session is missing — fetch user to restore session
      fetchUser();
    }
  }, []);

  // Persist featurePermissions to localStorage whenever it changes
  useEffect(() => {
    if (featurePermissions.length > 0) {
      sessionStorage.setItem('featurePermissions', JSON.stringify(featurePermissions));
    }
  }, [featurePermissions]);  // When featurePermissions changes, save to sessionStorage

  return (
    <UserContext.Provider value={{ userId, setUserId, loading, error, featurePermissions, fetchUser, role, authorities }}>
      {children}
    </UserContext.Provider>
  );
};
