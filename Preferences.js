import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Preferences() {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    age: "",
    insuranceType: "Health",
    budget: "",
    risk: "Medium",
    smokerStatus: "Non-Smoker", // ✅ smoker feature
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ pass smoker status also to recommendations page
    navigate("/recommendations", { state: preferences });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Insurance Preferences
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-lg"
      >
        {/* AGE */}
        <label className="block font-medium mb-2">Age</label>
        <input
          type="number"
          name="age"
          required
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange}
        />

        {/* INSURANCE TYPE */}
        <label className="block font-medium mb-2">Insurance Type</label>
        <select
          name="insuranceType"
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange}
        >
          <option>Health</option>
          <option>Life</option>
          <option>Auto</option>
        </select>

        {/* BUDGET */}
        <label className="block font-medium mb-2">Monthly Budget (₹)</label>
        <input
          type="number"
          name="budget"
          required
          className="w-full border p-2 rounded mb-4"
          onChange={handleChange}
        />

        {/* RISK */}
        <label className="block font-medium mb-2">Risk Preference</label>
        <select
          name="risk"
          className="w-full border p-2 rounded mb-6"
          onChange={handleChange}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
<label className="block font-medium mb-2">Smoking Status</label>

<div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <input
      type="radio"
      name="smokerStatus"
      value="Non-Smoker"
      checked={preferences.smokerStatus === "Non-Smoker"}
      onChange={handleChange}
      style={{ width: "16px", height: "16px" }}
    />
    Non-Smoker
  </label>

  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <input
      type="radio"
      name="smokerStatus"
      value="Smoker"
      checked={preferences.smokerStatus === "Smoker"}
      onChange={handleChange}
      style={{ width: "16px", height: "16px" }}
    />
    Smoker
  </label>
</div>
        {/* SUBMIT */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Get Recommendations
        </button>
      </form>
    </div>
  );
}
