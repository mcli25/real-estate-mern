import React, { useEffect, useState } from "react";

import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
  const [message, setMessage] = useState("");
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //context
  const { auth, signIn } = useAuth();

  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message);
      // Optional: Clear the message from the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (message) {
      // Automatically clear the message after 5 seconds
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    // Here you would typically make an API call to authenticate the user
    console.log("Login data:", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { email: formData.email, password: formData.password }
      );
      console.log("Server response:", response.data); // Debugging log

      signIn(response.data);
      alert("Login successful!");

      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Activation failed");
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "50px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    form: {
      width: "300px",
      padding: "20px",
      borderRadius: "15px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "50px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "20px",
    },
    error: {
      color: "red",
      marginTop: "10px",
    },
    logo: {
      fontSize: "40px",
      marginBottom: "20px",
      color: "#4CAF50",
    },
    linkContainer: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
      fontSize: "14px",
    },
    link: {
      color: "#4CAF50",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>🏠</div>
      {message && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Log in
        </button>
        <div style={styles.linkContainer}>
          <a href="/forgot-password" style={styles.link}>
            Forgot Password?
          </a>
          <a href="/register" style={styles.link}>
            Create Account
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
