// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Lesson from "./pages/LessonIndex";
import Menu from "./pages/Menu";
import Pricing from "./pages/Pricing";

import Program from "./pages/Program";
import Fatloss from "./pages/Fatloss";
import Strength from "./pages/Strength";
import Yoga from "./pages/Yoga";

import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";

import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import AdminGuard from "./components/AdminGuard";
import AdminUsers from "./pages/admin/Users";

import ChatBot from "./components/ChatBot";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import LessonIndex from "./pages/LessonIndex";
import LessonDetail from "./pages/LessonDetail";
import LessonWatch from "./pages/LessonWatch";
// ... các import khác

import { GoogleOAuthProvider } from "@react-oauth/google";
export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <div className="min-h-dvh w-full overflow-x-clip bg-[#0f1214] text-white flex flex-col">
          <Navbar />

          <main className="flex-1 w-full">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/thank-you" element={<ThankYou />} />

              {/* Programs (public) */}
              <Route
                path="/program"
                element={<Navigate to="/program/fatloss" replace />}
              />
              <Route path="/program/fatloss" element={<Fatloss />} />
              <Route path="/program/strength" element={<Strength />} />
              <Route path="/program/yoga" element={<Yoga />} />
              {/* Trang tổng quát (nếu dùng URL động) */}
              <Route path="/program/:plan" element={<Program />} />
              {/* tương thích link cũ */}
              <Route
                path="/fatloss"
                element={<Navigate to="/program/fatloss" replace />}
              />
              <Route path="/lesson" element={<LessonIndex />} />
              <Route path="/lesson/:id" element={<LessonDetail />} />
              <Route path="/lesson/:id/watch" element={<LessonWatch />} />
              {/* Protected (yêu cầu đăng nhập) */}
              <Route
                path="/account"
                element={
                  <RequireAuth>
                    <Account />
                  </RequireAuth>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route
                path="/lesson"
                element={
                  <RequireAuth>
                    <Lesson />
                  </RequireAuth>
                }
              />

              {/* Admin */}
              <Route
                path="/admin/users"
                element={
                  <AdminGuard>
                    <AdminUsers />
                  </AdminGuard>
                }
              />

              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              {/* 404 → về trang chủ */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          {/* Nút chat AI nổi toàn site */}
          <ChatBot />
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
