import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import Footer from './components/Footer';
import BreadcrumbNav from './components/BreadcrumbNav';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import FavoritePosts from './pages/FavoritePosts';
import MyPostsPage from './pages/MyPostsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import EditPostPage from './pages/EditPostPage';
import CartPage from './pages/CartPage';
import ClaimPostsPage from './pages/ClaimPostsPage';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

import './App.css';

const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <NavbarComponent />
            <BreadcrumbNav />
            <div className="flex-grow-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/create-post" element={<CreatePostPage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/favorites" element={<FavoritePosts />} />
                <Route path="/my-posts" element={<MyPostsPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/edit-post/:id" element={<EditPostPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/claim-posts" element={<ClaimPostsPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
};

export default App;