import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";

const EditAd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ad/${id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        setAd(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ad:", err);
        setError("Failed to fetch ad details. Please try again later.");
        setLoading(false);
      }
    };

    fetchAd();
  }, [id, auth.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAd((prevAd) => ({
      ...prevAd,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        type,
        title,
        description,
        builtyear,
        category,
        address,
        price,
        bedrooms,
        bathrooms,
        landSize,
        carpark,
        images,
        rentPeriod,
        location,
      } = ad;

      const adData = {
        type,
        title,
        description,
        builtyear,
        category,
        address,
        price,
        bedrooms,
        bathrooms,
        landSize,
        carpark,
        images,
        rentPeriod: type === "rent" ? rentPeriod : undefined,
        location,
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/ad/${id}`, adData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      toast.success("Ad updated successfully");
      navigate(`/ad/${id}`);
    } catch (err) {
      console.error("Error updating ad:", err);
      toast.error("Failed to update ad. Please try again later.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!ad) return <div className="alert alert-info m-3">Ad not found</div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Edit Ad</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={ad.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="type" className="form-label">
            Type
          </label>
          <select
            className="form-select"
            id="type"
            name="type"
            value={ad.type}
            onChange={handleChange}
            required
          >
            <option value="rent">For Rent</option>
            <option value="sell">For Sale</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={ad.description}
            onChange={handleChange}
            rows="3"
            required
          ></textarea>
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
            value={ad.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="price" className="form-label">
              Price
            </label>
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              value={ad.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="builtyear" className="form-label">
              Year Built
            </label>
            <input
              type="number"
              className="form-control"
              id="builtyear"
              name="builtyear"
              value={ad.builtyear}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="bedrooms" className="form-label">
              Bedrooms
            </label>
            <input
              type="number"
              className="form-control"
              id="bedrooms"
              name="bedrooms"
              value={ad.bedrooms}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="bathrooms" className="form-label">
              Bathrooms
            </label>
            <input
              type="number"
              className="form-control"
              id="bathrooms"
              name="bathrooms"
              value={ad.bathrooms}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="landSize" className="form-label">
              Land Size (sqm)
            </label>
            <input
              type="text"
              className="form-control"
              id="landSize"
              name="landSize"
              value={ad.landSize}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={ad.category}
            onChange={handleChange}
            required
          >
            <option value="terrace">Terrace</option>
            <option value="detached">Detached</option>
            <option value="semi-detached">Semi-Detached</option>
            <option value="bungalow">Bungalow</option>
            <option value="apartment">Apartment</option>
            <option value="other">Other</option>
          </select>
        </div>
        {ad.type === "rent" && (
          <div className="mb-3">
            <label htmlFor="rentPeriod" className="form-label">
              Rent Period
            </label>
            <select
              className="form-select"
              id="rentPeriod"
              name="rentPeriod"
              value={ad.rentPeriod}
              onChange={handleChange}
              required
            >
              <option value="day">Per Day</option>
              <option value="week">Per Week</option>
              <option value="month">Per Month</option>
              <option value="year">Per Year</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          Update Ad
        </button>
      </form>
    </div>
  );
};

export default EditAd;
