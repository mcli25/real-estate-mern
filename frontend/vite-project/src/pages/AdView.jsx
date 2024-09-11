import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Home,
  Calendar,
  DollarSign,
  Heart,
  Share2,
  MessageCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/auth";

const AdView = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 14,
  });
  const { auth } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isOwnAd, setIsOwnAd] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [savingAd, setSavingAd] = useState(false);

  useEffect(() => {
    const fetchAdAndWishlist = async () => {
      try {
        setLoading(true);
        const viewedAds = JSON.parse(localStorage.getItem("viewedAds") || "{}");
        const hasViewed = viewedAds[id];

        const [adResponse, wishlistResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/ad/${id}`, {
            headers: {
              "X-Increment-View": hasViewed ? "false" : "true",
            },
          }),
          auth.user
            ? axios.get(`${import.meta.env.VITE_API_URL}/users/wishlist`, {
                headers: { Authorization: `Bearer ${auth.token}` },
              })
            : Promise.resolve({ data: [] }),
        ]);

        setAd(adResponse.data);
        setIsOwnAd(auth.user && adResponse.data.user.id === auth.user.id);

        console.log(isOwnAd);
        if (Array.isArray(wishlistResponse.data)) {
          setIsSaved(wishlistResponse.data.some((item) => item.id === id));
        } else {
          console.error(
            "Wishlist data is not an array:",
            wishlistResponse.data
          );
          setIsSaved(false);
        }
        if (adResponse.data.location && adResponse.data.location.coordinates) {
          setViewport({
            latitude: adResponse.data.location.coordinates[1],
            longitude: adResponse.data.location.coordinates[0],
            zoom: 14,
          });
        }
        if (auth.user) {
          setName(auth.user.name || "");
          setPhone(auth.user.phone || "");
        }
        if (!hasViewed) {
          viewedAds[id] = true;
          localStorage.setItem("viewedAds", JSON.stringify(viewedAds));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch ad details. Please try again later.");
        setLoading(false);
      }
    };

    fetchAdAndWishlist();
  }, [id, auth.user, auth.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.user) {
      navigate("/login", {
        state: {
          from: `/ad/${id}`,
          formData: { name, phone, message },
        },
      });
      return;
    }

    setSendingEmail(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/send-email`,
        {
          adId: id,
          name,
          phone,
          message,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setEmailSent(true);
      setName("");
      setPhone("");
      setMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      setError("Failed to send email. Please try again later.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSave = async () => {
    if (!auth.user) {
      navigate("/login", { state: { from: `/ad/${id}` } });
      return;
    }
    try {
      setSavingAd(true);
      if (isSaved) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/users/wishlist/${id}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/users/wishlist`,
          { adId: id },
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
      }
      setIsSaved((prevState) => {
        return !prevState;
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setError("Failed to update wishlist. Please try again.");
    } finally {
      setSavingAd(false);
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
  if (!ad)
    return (
      <div className="alert alert-info m-5" role="alert">
        Ad not found
      </div>
    );

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="mb-2">{ad.title}</h1>
          <p className="text-muted">
            <MapPin className="me-1" size={18} />
            {ad.address}
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <h2 className="mb-2">€{Number(ad.price).toLocaleString()}</h2>
          <p className="text-muted">
            <Bed className="me-1" size={18} />
            {ad.bedrooms} bd
            <span className="mx-2">|</span>
            <Bath className="me-1" size={18} />
            {ad.bathrooms} ba
            <span className="mx-2">|</span>
            <Maximize className="me-1" size={18} />
            {ad.landSize} sqm
          </p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          {ad.images && ad.images.length > 0 ? (
            <div
              id="adCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                {ad.images.map((image, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <img
                      src={image}
                      className="d-block w-100"
                      alt={`Property image ${index + 1}`}
                      style={{ height: "500px", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
              {ad.images.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#adCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#adCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center p-5 bg-light">
              <p>No image for this property.</p>
            </div>
          )}
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <h3 className="mb-3">Overview</h3>
          <p>{ad.description}</p>

          <h3 className="mb-3 mt-4">Home Details</h3>
          <div className="row">
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>
                  <Home className="me-2" />
                  Type: {ad.type === "rent" ? "For Rent" : "For Sale"}
                </li>
                <li>
                  <Bed className="me-2" />
                  Bedrooms: {ad.bedrooms}
                </li>
                <li>
                  <Bath className="me-2" />
                  Bathrooms: {ad.bathrooms}
                </li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li>
                  <Maximize className="me-2" />
                  Land Size: {ad.landSize} sqm
                </li>
                <li>
                  <Calendar className="me-2" />
                  Year Built: {ad.builtyear}
                </li>
                <li>
                  <DollarSign className="me-2" />
                  Price: €{Number(ad.price).toLocaleString()}
                </li>
              </ul>
            </div>
          </div>

          <h3 className="mb-3 mt-4">Location</h3>
          <div style={{ height: "400px", width: "100%" }}>
            <Map
              mapboxAccessToken={import.meta.env.VITE_MAP_BOX_TOKEN}
              initialViewState={viewport}
              style={{ width: "100%", height: 400 }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
            >
              <Marker
                longitude={ad.location.coordinates[0]}
                latitude={ad.location.coordinates[1]}
                anchor="bottom"
              >
                <MapPin size={32} color="#FF0000" />
              </Marker>
            </Map>
          </div>
          <p className="text-muted mt-2">
            <Eye className="me-1" size={18} />
            {ad.viewCount || 0} views
          </p>
        </div>
        <div className="col-md-4">
          <div className="card">
            {!isOwnAd && (
              <div className="card-body">
                <h5 className="card-title">Contact Seller</h5>
                {emailSent ? (
                  <div className="alert alert-success">
                    Your message has been sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Your Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Your Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 mb-3"
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
                {!isOwnAd && (
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      key={`save-button-${isSaved}`}
                      className={`btn ${
                        isSaved ? "btn-success" : "btn-outline-danger"
                      } flex-grow-1 me-2`}
                      onClick={handleSave}
                      disabled={savingAd}
                    >
                      <Heart className="me-2" />
                      {savingAd ? "Saving..." : isSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdView;
