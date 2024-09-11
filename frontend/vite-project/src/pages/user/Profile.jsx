import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

const Profile = () => {
  const { auth, setAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${auth.user.username}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${profile.id}`,
        profile,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setAuth({ ...auth, user: response.data });
      setProfile(response.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === "string") {
          toast.error(error.response.data.error);
        } else if (Array.isArray(error.response.data.error)) {
          error.response.data.error.forEach((err) => toast.error(err));
        }
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleEdit = () => {
    if (editing) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost."
        )
      ) {
        setEditing(false);
        fetchProfile();
      }
    } else {
      setEditing(true);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">My Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={profile.username}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            className="form-control"
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="company" className="form-label">
            Company
          </label>
          <input
            type="text"
            className="form-control"
            id="company"
            name="company"
            value={profile.company}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        {editing ? (
          <div>
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={toggleEdit}
          >
            Edit Profile
          </button>
        )}
      </form>
    </div>
  );
};

export default Profile;
