import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Edit, Trash2, Eye } from "lucide-react";
import { useAuth } from "../../context/auth";

const Myads = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchMyAds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ad/user${
            filter ? `?type=${filter}` : ""
          }`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        console.log("Response data:", response.data);
        setAds(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ads:", err);
        console.error("Error response:", err.response);
        setError(
          err.response?.data?.error ||
            "Failed to fetch your ads. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchMyAds();
  }, [auth.token, filter]);

  const handleDelete = async (adId) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/ad/${adId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAds(ads.filter((ad) => ad.id !== adId));
      } catch (err) {
        console.error("Error deleting ad:", err);
        setError("Failed to delete the ad. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage My Ads</h1>
      <div className="mb-3">
        <button
          className={`btn ${
            filter === null ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        <button
          className={`btn ${
            filter === "rent" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setFilter("rent")}
        >
          Rent
        </button>
        <button
          className={`btn ${
            filter === "sell" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setFilter("sell")}
        >
          Sell
        </button>
      </div>
      {ads.length === 0 ? (
        <p>You haven't posted any ads yet.</p>
      ) : (
        <div className="row">
          {ads.map((ad) => (
            <div key={ad.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card">
                <img
                  src={ad.images[0]}
                  className="card-img-top"
                  alt={ad.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{ad.title}</h5>
                  <p className="card-text">
                    Price: €{Number(ad.price).toLocaleString()}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Link
                      to={`/ad/edit/${ad.id}`}
                      className="btn btn-outline-secondary"
                    >
                      <Edit size={18} className="me-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="btn btn-outline-danger"
                    >
                      <Trash2 size={18} className="me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Myads;
