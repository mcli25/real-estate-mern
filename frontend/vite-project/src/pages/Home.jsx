import React from "react";
import { useAuth } from "../context/auth";
import Navbar from "../components/Navbar";
const Home = () => {
  const { auth, isAuthenticated, signIn, signOut } = useAuth();

  return (
    <div>
      <h1>Home</h1>
      {isAuthenticated ? (
        <>
          <p>Welcome, {auth.user?.username}</p>
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <button
            onClick={() =>
              signIn({
                user: { name: "Test User" },
                token: "test_token",
                refreshToken: "test_refresh_token",
              })
            }
          >
            Sign In
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
