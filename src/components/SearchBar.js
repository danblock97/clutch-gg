"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import debounce from "lodash.debounce";
import {
  FaSearch,
  FaHistory,
  FaTimes,
  FaGamepad,
  FaChessKnight,
} from "react-icons/fa";
import PropTypes from "prop-types";

const regions = [
  { code: "BR1", name: "BR" },
  { code: "EUN1", name: "EUNE" },
  { code: "EUW1", name: "EUW" },
  { code: "JP1", name: "JP" },
  { code: "KR", name: "KR" },
  { code: "LA1", name: "LAN" },
  { code: "LA2", name: "LAS" },
  { code: "NA1", name: "NA" },
  { code: "ME1", name: "ME" },
  { code: "OC1", name: "OCE" },
  { code: "TR1", name: "TR" },
  { code: "RU", name: "RU" },
  { code: "SG2", name: "SG" },
  { code: "TW2", name: "TW" },
  { code: "VN2", name: "VN" },
];

const SearchBar = ({
  onSearch,
  initialRegion,
  initialGameType,
  isModal,
  onModalClose,
}) => {
  const [combinedInput, setCombinedInput] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(initialRegion || "EUW1");
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [recentlySearched, setRecentlySearched] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [gameType, setGameType] = useState(initialGameType || "league"); // "league" or "tft"
  const router = useRouter();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("recentlySearched");
      if (stored) {
        setRecentlySearched(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (initialRegion) {
      setSelectedRegion(initialRegion);
    }
  }, [initialRegion]);

  // Update gameType when initialGameType changes
  useEffect(() => {
    if (initialGameType) {
      setGameType(initialGameType);
    }
  }, [initialGameType]);

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    const [gameName, tagLinePartial] = input.split("#");
    const { data, error } = await supabase
      .from("riot_accounts")
      .select("gamename, tagline, region")
      .ilike("gamename", `${gameName || ""}%`)
      .ilike("tagline", `%${tagLinePartial || ""}%`)
      .limit(10);

    if (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } else {
      setSuggestions(data);
    }
  };

  const debouncedFetchSuggestions = useRef(
    debounce((input) => {
      fetchSuggestions(input);
    }, 300),
  ).current;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCombinedInput(value);
    debouncedFetchSuggestions(value);
    setIsDropdownVisible(true);
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  const handleGameTypeChange = (type) => {
    setGameType(type);
  };

  const handleSearch = (
    gameNameFromClick,
    tagLineFromClick,
    regionFromClick,
    gameTypeFromClick,
  ) => {
    const [gameName, tagLine] =
      gameNameFromClick && tagLineFromClick
        ? [gameNameFromClick, tagLineFromClick]
        : combinedInput.split("#");

    const region = regionFromClick || selectedRegion;
    const selectedGameType = gameTypeFromClick || gameType;

    if (gameName && tagLine && region) {
      try {
        const newEntry = {
          gameName,
          tagLine,
          region,
          gameType: selectedGameType,
        };
        const stored = sessionStorage.getItem("recentlySearched");
        let recent = stored ? JSON.parse(stored) : [];
        recent.unshift(newEntry);
        recent = recent.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (i) =>
                i.gameName === item.gameName &&
                i.tagLine === item.tagLine &&
                i.region === item.region,
            ),
        );
        if (recent.length > 5) recent = recent.slice(0, 5);
        sessionStorage.setItem("recentlySearched", JSON.stringify(recent));
        setRecentlySearched(recent);
      } catch (e) {
        console.error(e);
      }

      // Route to the appropriate page based on the game type
      const basePath = selectedGameType === "league" ? "/league" : "/tft";
      router.push(
        `${basePath}/profile?gameName=${encodeURIComponent(
          gameName,
        )}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`,
      );
      if (isModal && onModalClose) onModalClose();
    } else {
      // Show error in a more user-friendly way
      inputRef.current.classList.add("animate-shake");
      setTimeout(() => {
        inputRef.current.classList.remove("animate-shake");
      }, 500);
    }

    setCombinedInput("");
    setSuggestions([]);
    setIsDropdownVisible(false);

    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedGameName = suggestion.gamename;
    const selectedTagLine = suggestion.tagline;
    const region = suggestion.region;

    setCombinedInput(`${selectedGameName}#${selectedTagLine}`);
    setIsDropdownVisible(false);
    setSuggestions([]);
    handleSearch(selectedGameName, selectedTagLine, region);
  };

  const clearInput = () => {
    setCombinedInput("");
    setSuggestions([]);
    inputRef.current.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Adding keybinding for Escape to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isModal && onModalClose) {
        onModalClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isModal, onModalClose]);

  const searchBarContent = (
    <div
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto lg:mx-0"
      ref={dropdownRef}
    >
      <div
        className={`flex w-full h-12 glass rounded-lg overflow-hidden border transition-all duration-200 
        ${
          isInputFocused
            ? gameType === "tft"
              ? "border-[--tft-primary] shadow-lg shadow-[--tft-primary]/20"
              : "border-[--primary] shadow-lg shadow-[--primary]/20"
            : "border-[--card-border]"
        }
        ${
          !combinedInput &&
          inputRef.current?.classList.contains("animate-shake")
            ? "border-[--error]"
            : ""
        }`}
      >
        <select
          value={selectedRegion}
          onChange={handleRegionChange}
          className="bg-transparent text-[--text-primary] px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:bg-[--card-bg]/40 font-medium"
        >
          {regions.map((region) => (
            <option
              key={region.code}
              value={region.code}
              className="bg-[--card-bg] text-[--text-primary]"
            >
              {region.name}
            </option>
          ))}
        </select>

        <div className="relative flex-grow flex items-center">
          <input
            ref={inputRef}
            className="w-full h-full p-3 text-xs sm:text-sm text-[--text-primary] bg-transparent focus:outline-none placeholder-gray-500"
            type="text"
            placeholder="Summoner name#tag"
            value={combinedInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            autoComplete="off"
          />
          {combinedInput && (
            <button
              className="absolute right-1 text-gray-400 hover:text-white p-1 rounded-full"
              onClick={clearInput}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <button
          className={`flex items-center justify-center px-3 sm:px-4 text-[--text-primary] transition-colors duration-200 ${
            gameType === "tft"
              ? "hover:bg-[--tft-primary]"
              : "hover:bg-[--primary]"
          }`}
          onClick={() => handleSearch()}
          aria-label="Search"
        >
          <FaSearch className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isDropdownVisible &&
        (suggestions.length > 0 || recentlySearched.length > 0) && (
          <div
            className="absolute z-20 bg-[--card-bg] border border-[--card-border] shadow-xl rounded-xl w-full mt-2 overflow-hidden"
            style={{ top: "100%" }}
          >
            {suggestions.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-[--text-secondary] uppercase font-semibold border-b border-[--card-border]">
                  Suggestions
                </div>
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-3 hover:bg-[--card-bg-secondary] cursor-pointer transition-colors duration-150"
                      onClick={() => handleSuggestionClick(suggestion)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSuggestionClick(suggestion);
                        }
                      }}
                    >
                      <div className="text-[--text-primary] flex items-center">
                        <FaSearch className="text-[--text-secondary] mr-2 w-3 h-3" />
                        <span>
                          {suggestion.gamename}
                          <span className="text-[--text-secondary]">
                            #{suggestion.tagline}
                          </span>
                        </span>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-md font-medium bg-[--card-bg-secondary] text-[--text-secondary]">
                        {suggestion.region.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {recentlySearched.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs text-[--text-secondary] uppercase font-semibold border-b border-[--card-border]">
                  Recent Searches
                </div>
                <ul>
                  {recentlySearched.map((entry, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-3 hover:bg-[--card-bg-secondary] cursor-pointer transition-colors duration-150"
                      onClick={() =>
                        handleSearch(
                          entry.gameName,
                          entry.tagLine,
                          entry.region,
                          entry.gameType,
                        )
                      }
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleSearch(
                            entry.gameName,
                            entry.tagLine,
                            entry.region,
                            entry.gameType,
                          );
                        }
                      }}
                    >
                      <div className="text-[--text-primary] flex items-center">
                        <FaHistory className="text-[--text-secondary] mr-2 w-3 h-3" />
                        <span>
                          {entry.gameName}
                          <span className="text-[--text-secondary]">
                            #{entry.tagLine}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium rounded-md mr-1">
                          {entry.gameType === "tft" ? (
                            <FaChessKnight className="text-[--text-secondary]" />
                          ) : (
                            <FaGamepad className="text-[--text-secondary]" />
                          )}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-md font-medium bg-[--card-bg-secondary] text-[--text-secondary]">
                          {entry.region}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onModalClose}
          role="button"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onModalClose();
            }
          }}
        ></div>
        <div className="relative p-6 w-full max-w-lg bg-[--card-bg] rounded-xl shadow-2xl border border-[--card-border] animate-fade-in-up">
          <button
            className="absolute top-3 right-3 text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            onClick={onModalClose}
          >
            <FaTimes />
          </button>

          <h1 className="text-center text-2xl font-bold mb-4 text-[--text-primary]">
            Find a Player
          </h1>

          <div className="mb-6">{searchBarContent}</div>

          {recentlySearched.length > 0 && !isDropdownVisible && (
            <div className="mt-4">
              <div className="flex items-center my-4">
                <hr className="flex-grow border-[--card-border]" />
                <span className="mx-2 text-[--text-secondary] text-xs font-medium px-2">
                  RECENT SEARCHES
                </span>
                <hr className="flex-grow border-[--card-border]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recentlySearched.slice(0, 6).map((entry, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const basePath =
                        entry.gameType === "league" ? "/league" : "/tft";
                      router.push(
                        `${basePath}/profile?gameName=${encodeURIComponent(
                          entry.gameName,
                        )}&tagLine=${encodeURIComponent(
                          entry.tagLine,
                        )}&region=${entry.region}`,
                      );
                      if (onModalClose) onModalClose();
                    }}
                    className="text-[--text-primary] flex items-center p-2 rounded-lg hover:bg-[--card-bg-secondary] cursor-pointer transition-colors"
                  >
                    <FaHistory className="text-[--text-secondary] mr-2" />
                    <span className="truncate">
                      {entry.gameName}#{entry.tagLine}
                    </span>
                    <div className="ml-auto flex items-center">
                      <span className="text-xs mr-1">
                        {entry.gameType === "tft" ? (
                          <FaChessKnight className="text-[--text-secondary]" />
                        ) : (
                          <FaGamepad className="text-[--text-secondary]" />
                        )}
                      </span>
                      <span className="text-xs font-medium text-[--text-secondary] bg-[--card-bg] px-2 py-1 rounded-md">
                        {entry.region}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return searchBarContent;
};

export default SearchBar;

SearchBar.propTypes = {
  onSearch: PropTypes.func,
  initialRegion: PropTypes.string,
  initialGameType: PropTypes.string,
  isModal: PropTypes.bool,
  onModalClose: PropTypes.func,
};
