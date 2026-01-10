// import { useState, useRef } from "react";

// function LocationForm() {
//   const watchIdRef = useRef(null);

//   const [form, setForm] = useState({
//     name: "",
//     mobile: "",
//     latitude: "",
//     longitude: "",
//     accuracy: "",
//     area: "",
//     city: "",
//     state: "",
//     zipcode: "",
//     country: "",
//     error: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   /* ================= GET ADDRESS FROM LAT/LNG ================= */
//   const fetchAddressFromLatLng = async (lat, lng) => {
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
//       );

//       const data = await response.json();
//       const address = data.address || {};

//       setForm((prev) => ({
//         ...prev,
//         area:
//           address.suburb ||
//           address.neighbourhood ||
//           address.village ||
//           "",
//         city: address.city || address.town || address.county || "",
//         state: address.state || "",
//         zipcode: address.postcode || "",
//         country: address.country || "",
//       }));
//     } catch (err) {
//       setForm((prev) => ({
//         ...prev,
//         error: "Failed to fetch address details",
//       }));
//     }
//   };

//   /* ================= GET LOCATION ================= */
//   const getLocation = () => {
//     if (!navigator.geolocation) {
//       setForm((prev) => ({
//         ...prev,
//         error: "Geolocation is not supported by this browser",
//       }));
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       error: "Fetching high-accuracy GPS location...",
//     }));

//     watchIdRef.current = navigator.geolocation.watchPosition(
//       (position) => {
//         const { latitude, longitude, accuracy } = position.coords;

//         // ✅ Accept ONLY accuracy <= 21 meters
//         if (accuracy <= 21) {
//           const lat = latitude.toFixed(6);
//           const lng = longitude.toFixed(6);

//           setForm((prev) => ({
//             ...prev,
//             latitude: lat,
//             longitude: lng,
//             accuracy: `${Math.round(accuracy)} meters`,
//             error: "",
//           }));

//           fetchAddressFromLatLng(lat, lng);

//           // Stop watching once accurate location is found
//           navigator.geolocation.clearWatch(watchIdRef.current);
//         } else {
//           setForm((prev) => ({
//             ...prev,
//             error: `Low accuracy (${Math.round(
//               accuracy
//             )}m). Move outdoors & enable GPS.`,
//           }));
//         }
//       },
//       (error) => {
//         setForm((prev) => ({
//           ...prev,
//           error: error.message,
//         }));
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 30000,
//         maximumAge: 0,
//       }
//     );
//   };

//   /* ================= UI ================= */
//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h2 style={styles.title}>📍 High Accuracy Location</h2>

//         <input
//           style={styles.input}
//           name="name"
//           placeholder="Name"
//           value={form.name}
//           onChange={handleChange}
//         />

//         <input
//           style={styles.input}
//           name="mobile"
//           placeholder="Mobile Number"
//           value={form.mobile}
//           onChange={handleChange}
//         />

//         <input style={styles.input} placeholder="Latitude" value={form.latitude} readOnly />
//         <input style={styles.input} placeholder="Longitude" value={form.longitude} readOnly />
//         <input style={styles.input} placeholder="Accuracy" value={form.accuracy} readOnly />

//         <input style={styles.input} placeholder="Area" value={form.area} readOnly />
//         <input style={styles.input} placeholder="City" value={form.city} readOnly />
//         <input style={styles.input} placeholder="State" value={form.state} readOnly />
//         <input style={styles.input} placeholder="Zip Code" value={form.zipcode} readOnly />
//         <input style={styles.input} placeholder="Country" value={form.country} readOnly />

//         <button style={styles.button} onClick={getLocation}>
//           📡 Get High Accuracy Location
//         </button>

//         {form.error && <p style={styles.error}>{form.error}</p>}
//       </div>
//     </div>
//   );
// }

// export default LocationForm;

// /* ================= STYLES ================= */

// const styles = {
//   page: {
//     minHeight: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     background: "linear-gradient(135deg, #2563eb, #60a5fa)",
//     fontFamily: "Arial",
//   },
//   card: {
//     width: "380px",
//     background: "#fff",
//     padding: "25px",
//     borderRadius: "14px",
//     boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
//   },
//   title: {
//     textAlign: "center",
//     marginBottom: "15px",
//   },
//   input: {
//     width: "100%",
//     padding: "11px",
//     marginBottom: "12px",
//     borderRadius: "8px",
//     border: "1px solid #ccc",
//   },
//   button: {
//     width: "100%",
//     padding: "12px",
//     borderRadius: "10px",
//     border: "none",
//     background: "#2563eb",
//     color: "#fff",
//     fontSize: "16px",
//     cursor: "pointer",
//   },
//   error: {
//     color: "red",
//     textAlign: "center",
//     marginTop: "10px",
//   },
// };



import { useState, useRef } from "react";

function LocationForm() {
  const watchIdRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    latitude: "",
    longitude: "",
    accuracy: "",
    fullAddress: "",
    area: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    locationType: "",
    error: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= GOOGLE REVERSE GEOCODING ================= */
  const fetchExactAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );

      const data = await response.json();

      if (!data.results || !data.results.length) {
        throw new Error("No address found");
      }

      const result = data.results[0];
      const components = result.address_components;

      const getValue = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

      setForm((prev) => ({
        ...prev,
        fullAddress: result.formatted_address,
        area:
          getValue("sublocality") ||
          getValue("neighborhood") ||
          "",
        city: getValue("locality"),
        state: getValue("administrative_area_level_1"),
        zipcode: getValue("postal_code"),
        country: getValue("country"),
        locationType: result.geometry.location_type, // ROOFTOP / RANGE_INTERPOLATED
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        error: "Failed to fetch exact address",
      }));
    }
  };

  /* ================= GET LOCATION ================= */
  const getLocation = () => {
    if (!navigator.geolocation) {
      setForm((prev) => ({
        ...prev,
        error: "Geolocation not supported",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      error: "Fetching high-accuracy GPS location...",
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Accept only high accuracy
        if (accuracy <= 21) {
          const lat = latitude.toFixed(6);
          const lng = longitude.toFixed(6);

          setForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            accuracy: `${Math.round(accuracy)} meters`,
            error: "",
          }));

          fetchExactAddress(lat, lng);

          navigator.geolocation.clearWatch(watchIdRef.current);
        } else {
          setForm((prev) => ({
            ...prev,
            error: `Low accuracy (${Math.round(
              accuracy
            )}m). Move outdoors & enable GPS.`,
          }));
        }
      },
      (error) => {
        setForm((prev) => ({
          ...prev,
          error: error.message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  };

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📍 Exact Address Detection</h2>

        <input
          style={styles.input}
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
        />

        <input style={styles.input} placeholder="Latitude" value={form.latitude} readOnly />
        <input style={styles.input} placeholder="Longitude" value={form.longitude} readOnly />
        <input style={styles.input} placeholder="Accuracy" value={form.accuracy} readOnly />

        <textarea
          style={{ ...styles.input, height: "90px" }}
          placeholder="Full Exact Address"
          value={form.fullAddress}
          readOnly
        />

        {form.locationType && (
          <p style={{ textAlign: "center", fontSize: "14px" }}>
            📌 Accuracy Type:{" "}
            <b
              style={{
                color:
                  form.locationType === "ROOFTOP" ? "green" : "orange",
              }}
            >
              {form.locationType}
            </b>
          </p>
        )}

        <input style={styles.input} placeholder="Area" value={form.area} readOnly />
        <input style={styles.input} placeholder="City" value={form.city} readOnly />
        <input style={styles.input} placeholder="State" value={form.state} readOnly />
        <input style={styles.input} placeholder="Zip Code" value={form.zipcode} readOnly />
        <input style={styles.input} placeholder="Country" value={form.country} readOnly />

        <button style={styles.button} onClick={getLocation}>
          📡 Get Exact Address
        </button>

        {form.error && <p style={styles.error}>{form.error}</p>}
      </div>
    </div>
  );
}

export default LocationForm;

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    fontFamily: "Arial",
  },
  card: {
    width: "390px",
    background: "#fff",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "11px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "10px",
  },
};

