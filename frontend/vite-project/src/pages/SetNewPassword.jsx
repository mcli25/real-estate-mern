import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

const SetNewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/access-account`,
        { token, newPassword: password }
      );
      console.log("Server response:", response.data);
      setSuccess(
        response.data.message || "Password has been reset successfully."
      );
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } catch (error) {
      console.error("Reset password error:", error.response?.data);
      setError(error.response?.data?.message || "Failed to reset password");
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
          Set New Password
        </h2>
        <input
          type="password"
          name="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button type="submit" style={styles.button}>
          Reset Password
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

export default SetNewPassword;
