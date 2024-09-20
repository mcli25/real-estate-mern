import React, { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const SearchBar = ({
  onSearch,
  setSearchParams,
  searchParams,
  onPropertyTypeChange,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const salePrices = [
    { value: "", label: "No min" },
    { value: "50000", label: "€50,000" },
    { value: "100000", label: "€100,000" },
    { value: "200000", label: "€200,000" },
    { value: "300000", label: "€300,000" },
    { value: "400000", label: "€400,000" },
    { value: "500000", label: "€500,000" },
    { value: "600000", label: "€600,000" },
    { value: "700000", label: "€700,000" },
    { value: "800000", label: "€800,000" },
    { value: "900000", label: "€900,000" },
    { value: "1000000", label: "€1,000,000" },
  ];

  const rentPrices = [
    { value: "", label: "No min" },
    { value: "500", label: "€500" },
    { value: "1000", label: "€1,000" },
    { value: "1500", label: "€1,500" },
    { value: "2000", label: "€2,000" },
    { value: "2500", label: "€2,500" },
    { value: "3000", label: "€3,000" },
    { value: "3500", label: "€3,500" },
    { value: "4000", label: "€4,000" },
    { value: "4500", label: "€4,500" },
    { value: "5000", label: "€5,000" },
  ];

  const priceOptions = useMemo(
    () => (searchParams.propertyType === "For Rent" ? rentPrices : salePrices),
    [searchParams.propertyType]
  );

  const maxPriceOptions = useMemo(() => {
    const minPriceValue = parseInt(searchParams.minPrice) || 0;
    return [
      { value: "", label: "No max" },
      ...priceOptions.filter(
        (option) => parseInt(option.value) > minPriceValue
      ),
    ];
  }, [priceOptions, searchParams.minPrice]);

  return (
    <div className="search-bar bg-white p-4 shadow-lg rounded-lg">
      <div className="row g-2 align-items-center">
        <div className="col-lg-4 col-md-12">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={20} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              name="location"
              value={searchParams.location}
              onChange={handleInputChange}
              placeholder="Enter an address, neighborhood, city"
            />
          </div>
        </div>
        <div className="col-lg-2 col-md-4">
          <select
            className="form-select"
            name="propertyType"
            value={searchParams.propertyType}
            onChange={(e) => {
              handleInputChange(e);
              onPropertyTypeChange(e.target.value);
            }}
          >
            <option>For Sale</option>
            <option>For Rent</option>
          </select>
        </div>
        <div className="col-lg-5 col-md-8">
          <select
            className="form-select"
            name="minPrice"
            value={searchParams.minPrice}
            onChange={handleInputChange}
          >
            <option value="">Min Price</option>
            {priceOptions.map((price) => (
              <option key={price.value} value={price.value}>
                {price.label}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            name="maxPrice"
            value={searchParams.maxPrice}
            onChange={handleInputChange}
          >
            <option value="">Max Price</option>
            {maxPriceOptions.map((price) => (
              <option key={price.value} value={price.value}>
                {price.label}
              </option>
            ))}
          </select>
          {searchParams.propertyType === "For Rent" && <span>Per Month</span>}
        </div>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-link text-decoration-none p-0"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          Advanced Search{" "}
          <ChevronDown
            size={16}
            className={`ms-1 transition-transform ${
              isAdvancedOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isAdvancedOpen && (
        <div className="row g-2 mt-3">
          <div className="col-md-3">
            <select
              className="form-select"
              name="beds"
              value={searchParams.beds}
              onChange={handleInputChange}
            >
              <option value="">Beds</option>
              <option value="1+">1+ bed</option>
              <option value="2+">2+ beds</option>
              <option value="3+">3+ beds</option>
              <option value="4+">4+ beds</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              name="baths"
              value={searchParams.baths}
              onChange={handleInputChange}
            >
              <option value="">Baths</option>
              <option value="1+">1+ baths</option>
              <option value="2+">2+ baths</option>
              <option value="3+">3+ baths</option>
              <option value="4+">4+ baths</option>
            </select>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              name="homeType"
              value={searchParams.homeType}
              onChange={handleInputChange}
            >
              <option value="">Home Type</option>
              <option value="terrace">Terrace</option>
              <option value="detached">Detached</option>
              <option value="semi-detached">Semi-detached</option>
              <option value="bungalow">Bungalow</option>
              <option value="apartment">Apartment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
