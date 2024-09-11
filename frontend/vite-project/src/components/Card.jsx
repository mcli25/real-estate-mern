import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Tag,
  Calendar,
  Car,
  Image as ImageIcon,
} from "lucide-react";

const Card = ({ house }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/ad/${house.id}`} className="text-decoration-none">
      <div className="card h-100 shadow-sm hover-card">
        <div className="position-relative">
          {!imageError && house.images && house.images.length > 0 ? (
            <>
              <img
                src={house.images[0]}
                alt={house.title}
                className={`card-img-top object-fit-cover ${
                  imageLoaded ? "" : "d-none"
                }`}
                style={{ height: "200px" }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {!imageLoaded && (
                <div
                  className="card-img-top d-flex align-items-center justify-content-center bg-light"
                  style={{ height: "200px" }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="card-img-top d-flex align-items-center justify-content-center bg-light"
              style={{ height: "200px" }}
            >
              <ImageIcon size={48} className="text-secondary" />
            </div>
          )}
        </div>
        <div className="card-body">
          <h5 className="card-title text-truncate">{house.title}</h5>
          <p className="card-text small text-muted mb-2 line-clamp-2">
            {house.description.substring(0, 20)}
          </p>
          <div className="mb-2">
            <MapPin size={16} className="me-1 text-primary" />
            <small className="text-muted">{house.address}</small>
          </div>
          <h6 className="mb-3 text-primary">
            <strong>€{Number(house.price).toLocaleString()}</strong>
            {house.type === "rent" && (
              <small className="text-muted ms-1">/month</small>
            )}
          </h6>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <Bed size={16} className="me-1 text-secondary" />
                <small>{house.bedrooms} Beds</small>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <Bath size={16} className="me-1 text-secondary" />
                <small>{house.bathrooms} Baths</small>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <Maximize size={16} className="me-1 text-secondary" />
                <small>{house.landSize} sqm</small>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <Car size={16} className="me-1 text-secondary" />
                <small>{house.carpark} Parking</small>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <Calendar size={14} className="me-1" />
              Built in {house.builtyear}
            </small>
            <small className="text-muted">
              <Tag size={14} className="me-1" />
              {house.category}
            </small>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;
