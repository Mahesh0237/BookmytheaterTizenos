import React from 'react'
import LandingPage from './pages/LandingPage'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Loginpage'
import BrowsePage from './pages/browsepage/Browsepage'
import SearchMoviePage from './pages/Searchmoviepage'
import CategoriesPage from './pages/CategoriesPage'
import MyaccountWrapperPage from './pages/MyaccountwrapperPage'
import SingleMoviePage from './pages/SingleMoviePage'
import Movieplayer from './pages/Movieplayer'
import { useUserdetails } from './components/zustand/useUserdetails'

function Approuter() {
  const { isLogged } = useUserdetails();

  // Protected route - requires authentication
  const ProtectedRoute = ({ isLoggedIn }) => {
    if (isLoggedIn === false) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  };

  // Auth check route - redirects if already logged in
  const AuthCheckRoute = ({ isLoggedIn }) => {
    if (isLoggedIn === true) {
      return <Navigate to="/browse" replace />;
    }
    return <Outlet />;
  };

  // Public route - accessible regardless of auth status
  const PublicRoute = () => {
    return <Outlet />;
  };

  return (
    <Routes>
      {/* Public routes - accessible to all users */}
      <Route element={<PublicRoute />}>
        <Route path="/movie/:uuid" element={<SingleMoviePage />} />
        <Route path="/player" element={<Movieplayer />} />
      </Route>

      {/* Auth routes - only for non-authenticated users */}
      <Route element={<AuthCheckRoute isLoggedIn={isLogged} />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes - only for authenticated users */}
      <Route element={<ProtectedRoute isLoggedIn={isLogged} />}>
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/myaccount/*" element={<MyaccountWrapperPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/searchmovie" element={<SearchMoviePage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={isLogged ? "/browse" : "/"} replace />} />
    </Routes>
  );
}

export default Approuter