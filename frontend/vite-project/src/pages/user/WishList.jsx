import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../context/auth";

const WishList = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuth();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/wishlist`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setWishlist(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to fetch wishlist. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.user) {
      fetchWishlist();
    }
  }, [auth.user, auth.token]);

  const handleRemoveFromWishlist = async (adId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/wishlist/${adId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.id !== adId)
      );
      alert("Property removed from wishlist");
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove property from wishlist. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="alert alert-danger m-5" role="alert">
        {error}
      </div>
    );

  return (
    <div className="container mt-5">
      <h1 className="mb-4">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="alert alert-info">
          Your wishlist is empty. Start browsing properties to add some!
        </div>
      ) : (
        <div className="row">
          {wishlist.map((property) => (
            <div key={property.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={property.images[0]}
                  className="card-img-top"
                  alt={property.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{property.title}</h5>
                  <p className="card-text">{property.address}</p>
                  <p className="card-text">
                    <strong>€{Number(property.price).toLocaleString()}</strong>
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/ad/${property.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(property.id)}
                      className="btn btn-outline-danger"
                    >
                      <Trash2 size={18} />
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

export default WishList;
