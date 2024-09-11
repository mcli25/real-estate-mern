import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import CurrencyInput from "react-currency-input-field";
import { useAuth } from "../../context/auth";

const CreateAd = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [ad, setAd] = useState({
    type: "sell",
    title: "",
    description: "",
    builtyear: "",
    category: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    landSize: "",
    carpark: "",
    images: [],
    rentPeriod: "month",
    latitude: 0,
    longitude: 0,
    uploading: false,
    loading: false,
  });

  const [fileNames, setFileNames] = useState([]);
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 10,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1799 },
    (_, i) => currentYear - i
  );
  const { auth } = useAuth();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewport({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          zoom: 10,
        });
        setAd((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {
        console.log("Unable to get location");
        toast.error("Unable to get your location. Please enter it manually.");
      }
    );
  }, []);

  useEffect(() => {
    // Cleanup function to revoke object URLs to avoid memory leaks
    return () =>
      selectedImages.forEach((image) => URL.revokeObjectURL(image.preview));
  }, [selectedImages]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setAd((prev) => ({ ...prev, [name]: files }));
      setFileNames(Array.from(files).map((file) => file.name));
    } else {
      setAd((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleMapClick = (event) => {
    setAd((prev) => ({
      ...prev,
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    }));
  };
  const handleAddressChange = async (e) => {
    const address = e.target.value;
    setAd((prev) => ({ ...prev, address }));

    if (address.length > 3) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address
          )}.json?access_token=${
            import.meta.env.VITE_MAP_BOX_TOKEN
          }&autocomplete=true&limit=5&country=IE`
        );

        if (response.data.features) {
          setSuggestions(response.data.features);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        toast.error("Failed to fetch address suggestions. Please try again.");
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const [longitude, latitude] = suggestion.center;

    setAd((prev) => ({
      ...prev,
      address: suggestion.place_name,
      latitude,
      longitude,
    }));
    setViewport((prev) => ({
      ...prev,
      latitude,
      longitude,
      zoom: 15,
    }));
    setSuggestions([]);
  };

  const handlePriceChange = (value, name) => {
    setAd((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setAd((prev) => ({ ...prev, uploading: true }));

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ad/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newImages = files.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        s3Url: response.data.urls[index],
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
      setAd((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data.urls],
        uploading: false,
      }));

      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
      setAd((prev) => ({ ...prev, uploading: false }));
    }
  };

  const removeImage = async (index) => {
    const imageToRemove = selectedImages[index];

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/ad/remove-image`, {
        data: { key: imageToRemove.s3Url },
      });

      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      setAd((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      URL.revokeObjectURL(imageToRemove.preview);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAd((prev) => ({ ...prev, loading: true }));
    try {
      const adData = {
        type: ad.type,
        title: ad.title,
        description: ad.description,
        builtyear: ad.builtyear,
        category: ad.category,
        address: ad.address,
        price: ad.price,
        bedrooms: ad.bedrooms,
        bathrooms: ad.bathrooms,
        landSize: ad.landSize,
        carpark: ad.carpark,
        images: ad.images,
        rentPeriod: ad.type === "rent" ? ad.rentPeriod : undefined,
        location: {
          type: "Point",
          coordinates: [ad.longitude, ad.latitude],
        },
      };

      const token = auth.token;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/ad/add-ad`,
        adData,
        {
          headers,
        }
      );

      console.log("Received response:", data);

      toast.success("Ad created successfully");
      navigate("/dashboard/myads");
    } catch (err) {
      console.error("Error details:", err.response || err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to create ad"
      );
    } finally {
      setAd((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title mb-4">Create New Ad</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="type"
                      id="sell"
                      value="sell"
                      checked={ad.type === "sell"}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-primary" htmlFor="sell">
                      Sell
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="type"
                      id="rent"
                      value="rent"
                      checked={ad.type === "rent"}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-primary" htmlFor="rent">
                      Rent
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <CurrencyInput
                      id="price"
                      name="price"
                      placeholder={ad.type === "sell" ? "Price" : "Rent"}
                      value={ad.price}
                      decimalsLimit={2}
                      onValueChange={(value, name) =>
                        handlePriceChange(value, name)
                      }
                      prefix="€"
                      className="form-control"
                    />
                    {ad.type === "rent" && (
                      <select
                        className="form-select"
                        style={{ maxWidth: "30%" }}
                        name="rentPeriod"
                        value={ad.rentPeriod}
                        onChange={handleChange}
                      >
                        <option value="day">Per Day</option>
                        <option value="week">Per Week</option>
                        <option value="month">Per Month</option>
                        <option value="year">Per Year</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="row">
                    <div className="col-md-8 mb-2 mb-md-0">
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        placeholder="Title"
                        value={ad.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        name="category"
                        value={ad.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="terrace">Terrace</option>
                        <option value="detached">Detached</option>
                        <option value="semi-detached">Semi-Detached</option>
                        <option value="bungalow">Bungalow</option>
                        <option value="apartment">Apartment</option>
                        <option value="other">Other</option>
                      </select>
                      <select
                        className="form-select"
                        name="builtyear"
                        value={ad.builtyear}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Built Year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control"
                    name="description"
                    placeholder="Description"
                    value={ad.description}
                    onChange={handleChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="mb-3 position-relative">
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    placeholder="Address"
                    value={ad.address}
                    onChange={handleAddressChange}
                    required
                  />
                  {suggestions.length > 0 && (
                    <ul
                      className="list-group position-absolute w-100 mt-1"
                      style={{ zIndex: 1000 }}
                    >
                      {suggestions.map((suggestion) => (
                        <li
                          key={suggestion.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          {suggestion.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-6 col-md-3 mb-2">
                    <input
                      type="number"
                      className="form-control"
                      name="bedrooms"
                      placeholder="Beds"
                      value={ad.bedrooms}
                      onChange={handleChange}
                      min={1}
                    />
                  </div>
                  <div className="col-6 col-md-3 mb-2">
                    <input
                      type="number"
                      className="form-control"
                      name="bathrooms"
                      placeholder="Baths"
                      value={ad.bathrooms}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                  <div className="col-6 col-md-3 mb-2">
                    <input
                      type="text"
                      className="form-control"
                      name="landSize"
                      placeholder="Land Size"
                      value={ad.landSize}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      name="carpark"
                      placeholder="Carpark"
                      value={ad.carpark}
                      onChange={handleChange}
                      min={0}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Property Location</label>
                  <div style={{ height: "200px" }}>
                    <Map
                      {...viewport}
                      onMove={(evt) => setViewport(evt.viewState)}
                      mapboxAccessToken={import.meta.env.VITE_MAP_BOX_TOKEN}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      onClick={handleMapClick}
                    >
                      <Marker
                        latitude={ad.latitude}
                        longitude={ad.longitude}
                        draggable
                        onDragEnd={(event) => {
                          setAd((prev) => ({
                            ...prev,
                            latitude: event.lngLat.lat,
                            longitude: event.lngLat.lng,
                          }));
                        }}
                      />
                    </Map>
                  </div>
                  <small className="text-muted">
                    Click on the map to set the property location or drag the
                    marker.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload Images</label>
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleFileButtonClick}
                      disabled={ad.uploading}
                    >
                      <i className="bi bi-cloud-upload me-2"></i>
                      {ad.uploading ? "Uploading..." : "Choose Files"}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                    />
                    <span className="ms-3 text-muted">
                      {selectedImages.length > 0
                        ? `${selectedImages.length} file(s) selected`
                        : "No files chosen"}
                    </span>
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="mt-3">
                      <div className="row">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="col-4 col-md-3 mb-3">
                            <div className="position-relative">
                              <img
                                src={image.preview}
                                alt={`preview ${index}`}
                                className="img-thumbnail"
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                onClick={() => removeImage(index)}
                              >
                                &times;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Create Ad
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAd;
