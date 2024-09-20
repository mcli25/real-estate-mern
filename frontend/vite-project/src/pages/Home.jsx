import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/auth";
import SearchBar from "../components/SearchBar";
import Card from "../components/Card";
import axios from "axios";

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "For Sale",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
    homeType: "",
  });
  const [allHouses, setAllHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 3;

  const fetchHouses = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/ad`, {
        params: {
          page: page,
          limit: pageSize,
          type: searchParams.propertyType === "For Rent" ? "rent" : "sell",
        },
      });
      setAllHouses(response.data.ads || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching houses:", err);
      setError("Failed to fetch houses. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses(currentPage);
  }, [currentPage, searchParams.propertyType]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredHouses = useMemo(() => {
    return allHouses.filter((house) => {
      if (
        searchParams.location &&
        !house.address
          .toLowerCase()
          .includes(searchParams.location.toLowerCase())
      )
        return false;
      if (searchParams.minPrice && house.price < Number(searchParams.minPrice))
        return false;
      if (searchParams.maxPrice && house.price > Number(searchParams.maxPrice))
        return false;
      if (
        searchParams.beds &&
        house.bedrooms < Number(searchParams.beds.replace("+", ""))
      )
        return false;
      if (
        searchParams.baths &&
        house.bathrooms < Number(searchParams.baths.replace("+", ""))
      )
        return false;
      if (searchParams.homeType && house.category !== searchParams.homeType)
        return false;
      return true;
    });
  }, [allHouses, searchParams]);

  return (
    <div className="container-fluid p-0">
      <SearchBar
        setSearchParams={setSearchParams}
        searchParams={searchParams}
      />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            {searchParams.propertyType === "For Rent"
              ? "Houses for Rent"
              : "Houses for Sale"}
          </h2>
        </div>
        {loading ? (
          <p>Loading houses...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <>
            <div className="row">
              {filteredHouses.length > 0 ? (
                filteredHouses.map((house) => (
                  <div key={house._id} className="col-md-4 mb-4">
                    <Card house={house} />
                  </div>
                ))
              ) : (
                <p>No houses found matching your criteria.</p>
              )}
            </div>
            {filteredHouses.length > 0 && (
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((page) => (
                    <li
                      key={page + 1}
                      className={`page-item ${
                        currentPage === page + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
