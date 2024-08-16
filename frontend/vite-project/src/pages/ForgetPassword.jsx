import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/forget-password`,
        { email }
      );
      console.log("Server response:", response.data);
      setSuccess(
        response.data.message || "Password reset link sent to your email."
      );
    } catch (error) {
      console.error("Forgot password error:", error.response?.data);
      setError(error.response?.data?.message || "Failed to send reset link");
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
    success: {
      color: "green",
      marginTop: "10px",
    },
    logo: {
      fontSize: "40px",
      marginBottom: "20px",
      color: "#4CAF50",
    },
    linkContainer: {
      display: "flex",
      justifyContent: "center",
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
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Forgot Password
        </h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button type="submit" style={styles.button}>
          Send Reset Link
        </button>
        <div style={styles.linkContainer}>
          <Link to="/login" style={styles.link}>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
