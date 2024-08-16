import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { auth, isAuthenticated, signOut } = useAuth();
  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log(dropdownRef.current);
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav>
      <ul className="nav justify-content-center">
        <li className="nav-item">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Home
          </NavLink>
        </li>
        {!isAuthenticated && (
          <li className="nav-item">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Login
            </NavLink>
          </li>
        )}
        {!isAuthenticated && (
          <li className="nav-item">
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Register
            </NavLink>
          </li>
        )}
        {isAuthenticated && (
          <li className="nav-item dropdown" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="nav-link dropdown-toggle"
            >
              {auth.user?.username}
            </button>
            <ul className={`dropdown-menu ${isOpen ? "show" : ""}`}>
              <li>
                <NavLink to="/about" className="dropdown-item">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="dropdown-item">
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink to="/faq" className="dropdown-item">
                  FAQ
                </NavLink>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink
                    to="/login"
                    className="dropdown-item"
                    onClick={signOut}
                  >
                    Sign out
                  </NavLink>
                </li>
              )}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
