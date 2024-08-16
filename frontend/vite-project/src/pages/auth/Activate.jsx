import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/auth";

const Activate = () => {
  const { auth, signIn } = useAuth(); // Correctly destructure from useAuth
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get("token");
  console.log(token);
  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        toast.error("No activation token found");
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/register`,
          { token }
        );
        console.log("Server response:", response.data); // Debugging log

        signIn(response.data);
        navigate("/");
      } catch (error) {
        console.error("Activation error:", error.response?.data);
        toast.error(error.response?.data?.message || "Activation failed");
      }
    };

    activateAccount();
  }, [token]);

  return <div>Activating your account...</div>;
};

export default Activate;
