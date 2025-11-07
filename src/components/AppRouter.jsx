import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Searchmoviepage from './pages/Searchmoviepage';
import LandingPage from "./pages/landingpage/LandingPage";
import MyaccountwrapperPage from "./pages/myaccount/MyaccountwrapperPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import Browsepage from "./pages/browsepage/Browsepage.jsx";
import SingleMoviePage from "./pages/SingleMoviePage.jsx";
import Movieplayer from "./pages/Movieplayer.jsx";
import { useUserdetails } from "./components/zustand/useUserdetails.js";

const AppRouter = () => {
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
        <Route path="/browse" element={<Browsepage />} />
        <Route path="/myaccount/*" element={<MyaccountwrapperPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/searchmovie" element={<Searchmoviepage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={isLogged ? "/browse" : "/"} replace />} />
    </Routes>
  );
};

export default AppRouter;
