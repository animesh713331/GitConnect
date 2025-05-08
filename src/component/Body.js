import React, { useEffect, useState, useCallback } from "react";

function Body() {
  const [profile, setProfile] = useState([]);
  const [numberOfProfile, setNumberOfProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const generateProfile = useCallback(async (count) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const ran = Math.floor(1 + Math.random() * 1000);
      const response = await fetch(`https://api.github.com/users?since=${ran}&per_page=${count}`);
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profiles:", error?.message || error);
      setErrorMsg("Failed to fetch profiles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByUsername = async () => {
    if (numberOfProfile.trim() === "") return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`https://api.github.com/users/${numberOfProfile}`);
      if (!response.ok) {
        setProfile([]);
        setErrorMsg("User not found");
        return;
      }
      const data = await response.json();
      setProfile([data]);
    } catch (error) {
      console.error("Error searching user:", error?.message || error);
      setErrorMsg("Failed to search user. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateProfile(10);
  }, [generateProfile]);

  return (
    <div className="container">
      <div className="theme-toggle">
        <label className="switch">
          <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
          <span className="slider"></span>
        </label>
        <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
      </div>

      <input
        type="text"
        className="input"
        placeholder="Search by username or number"
        value={numberOfProfile}
        onChange={(e) => setNumberOfProfile(e.target.value)}
      />

      <button
        className="search-button"
        onClick={() => {
          const isNumeric = /^\d+$/.test(numberOfProfile);
          isNumeric ? generateProfile(Number(numberOfProfile)) : searchByUsername();
        }}
      >
        Search Profile
      </button>

      {isLoading && <p className="loading">Loading profiles...</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="profiles">
        {profile.length > 0 ? (
          profile.map((value) => (
            <div key={value.id} className="card">
              <img src={value.avatar_url} alt={value.login} />
              <h2>{value.login}</h2>
              <a href={value.html_url} target="_blank" rel="noreferrer">
                View Profile
              </a>
            </div>
          ))
        ) : (
          !isLoading && <p>No profiles found</p>
        )}
      </div>
    </div>
  );
}

export default Body;
