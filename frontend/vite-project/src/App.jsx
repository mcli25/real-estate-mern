import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/auth";
import Navbar from "./components/Navbar";
import Activate from "./pages/auth/Activate";
import ForgotPassword from "./pages/ForgetPassword";
import SetNewPassword from "./pages/SetNewPassword";
import DashBoard from "./pages/user/DashBoard";
import CreateAd from "./pages/user/CreateAd";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdView from "./pages/AdView";
import WishList from "./pages/user/WishList";
import Profile from "./pages/user/Profile";
import Myads from "./pages/user/Myads";
import EditAd from "./pages/user/EditAd";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AuthProvider>
        <Navbar></Navbar>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm-registration" element={<Activate />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<SetNewPassword />} />
          <Route path="/ad/:id" element={<AdView />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/ad/edit/:id" element={<EditAd />} />

            <Route path="/dashboard" element={<DashBoard />}>
              <Route index element={<h2>Dashboard Home</h2>} />
              <Route path="create-ad" element={<CreateAd />} />
              <Route path="wishlist" element={<WishList />} />
              <Route path="profile" element={<Profile />} />
              <Route path="myads" element={<Myads />} />
              {/* <Route path="analytics" element={<Analytics />} /> */}
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
