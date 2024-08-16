import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/pre-register`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      navigate("/login", {
        state: {
          message:
            "Registration successful. Please check your email to complete the process.",
        },
      });
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error || "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };
  const buttonStyle = {
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
    button: buttonStyle,
    error: {
      color: "red",
      marginTop: "10px",
    },
    logo: {
      fontSize: "40px",
      marginBottom: "20px",
      color: "#4CAF50",
    },
    loginOption: {
      marginTop: "20px",
      textAlign: "center",
      fontSize: "14px",
    },
    loginLink: {
      color: "#4CAF50",
      textDecoration: "none",
      fontWeight: "bold",
    },
    loadingButton: {
      ...buttonStyle,
      opacity: 0.7,
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>🏠</div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          style={styles.input}
          disabled={loading}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button
          type="submit"
          style={loading ? styles.loadingButton : styles.button}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
        <div style={styles.loginOption}>
          Already have an account?{" "}
          <Link to="/login" style={styles.loginLink}>
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
