import React, { useState, useEffect } from "react";

const StreakCounter = () => {
  const [streaks, setStreaks] = useState({});
  const [newStreakName, setNewStreakName] = useState("");
  const [selectedStreak, setSelectedStreak] = useState("");

  // Load streaks from localStorage on component mount
  useEffect(() => {
    const savedStreaks = localStorage.getItem("streakData");
    if (savedStreaks) {
      try {
        const parsedStreaks = JSON.parse(savedStreaks);
        setStreaks(parsedStreaks);
        if (Object.keys(parsedStreaks).length > 0 && !selectedStreak) {
          setSelectedStreak(Object.keys(parsedStreaks)[0]);
        }
      } catch (error) {
        console.error("Error loading streak data:", error);
      }
    }
  }, []);

  // Save streaks to localStorage whenever streaks change
  useEffect(() => {
    if (Object.keys(streaks).length > 0) {
      localStorage.setItem("streakData", JSON.stringify(streaks));
    }
  }, [streaks]);

  const addStreak = () => {
    if (newStreakName.trim() && !streaks[newStreakName]) {
      const newStreaks = {
        ...streaks,
        [newStreakName]: {
          count: 0,
          history: [],
          lastUpdated: null,
        },
      };
      setStreaks(newStreaks);
      setSelectedStreak(newStreakName);
      setNewStreakName("");
    }
  };

  const incrementStreak = (streakName) => {
    const today = new Date().toDateString();
    const streak = streaks[streakName];

    if (streak.lastUpdated !== today) {
      const newHistory = [...streak.history];
      if (newHistory.length >= 30) {
        newHistory.shift();
      }
      newHistory.push(streak.count + 1);

      setStreaks({
        ...streaks,
        [streakName]: {
          count: streak.count + 1,
          history: newHistory,
          lastUpdated: today,
        },
      });
    }
  };

  const resetStreak = (streakName) => {
    setStreaks({
      ...streaks,
      [streakName]: {
        count: 0,
        history: [],
        lastUpdated: null,
      },
    });
  };

  const deleteStreak = (streakName) => {
    const newStreaks = { ...streaks };
    delete newStreaks[streakName];
    setStreaks(newStreaks);
    if (selectedStreak === streakName) {
      setSelectedStreak(Object.keys(newStreaks)[0] || "");
    }
  };

  const renderGraph = () => {
    if (
      !selectedStreak ||
      !streaks[selectedStreak] ||
      streaks[selectedStreak].history.length === 0
    ) {
      return (
        <div className="w-full h-48 flex items-center justify-center backdrop-blur-sm bg-white/30 shadow-sm rounded-lg">
          <span className="text-gray-500">No data to display</span>
        </div>
      );
    }

    const history = streaks[selectedStreak].history;
    const maxValue = Math.max(...history, 1);
    const barWidth = Math.max(
      12,
      Math.floor(480 / Math.max(history.length, 1))
    );
    const spacing = 2;

    return (
      <div className="w-full h-48 backdrop-blur-sm bg-white/30 shadow-sm rounded-lg p-4">
        <div className="w-full h-full flex items-end justify-center space-x-1">
          {history.map((value, index) => {
            const height = Math.max(4, (value / maxValue) * 152);
            return (
              <div
                key={index}
                className="bg-gray-600 rounded-t-sm flex-shrink-0"
                style={{
                  height: `${height}px`,
                  width: `${barWidth}px`,
                }}
                title={`Day ${index + 1}: ${value}`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-6 backdrop-blur-sm bg-white/30 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Streak Counter
      </h1>

      {/* Add new streak */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStreakName}
            onChange={(e) => setNewStreakName(e.target.value)}
            placeholder="Enter streak name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            onKeyPress={(e) => e.key === "Enter" && addStreak()}
          />
          <button
            onClick={addStreak}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Streak selector */}
      {Object.keys(streaks).length > 0 && (
        <div className="mb-6">
          <select
            value={selectedStreak}
            onChange={(e) => setSelectedStreak(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {Object.keys(streaks).map((streakName) => (
              <option key={streakName} value={streakName}>
                {streakName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current streak display */}
      {selectedStreak && streaks[selectedStreak] && (
        <div className="mb-6">
          <div className="text-center backdrop-blur-sm bg-white/30 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              {selectedStreak}
            </h2>
            <div className="text-4xl font-bold text-gray-700 mb-4">
              {streaks[selectedStreak].count}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => incrementStreak(selectedStreak)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={
                  streaks[selectedStreak].lastUpdated ===
                  new Date().toDateString()
                }
              >
                +1
              </button>
              <button
                onClick={() => resetStreak(selectedStreak)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => deleteStreak(selectedStreak)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Progress History
        </h3>
        {renderGraph()}
      </div>

      {/* Streak list */}
      {Object.keys(streaks).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            All Streaks
          </h3>
          <div className="space-y-2">
            {Object.entries(streaks).map(([name, data]) => (
              <div
                key={name}
                className="backdrop-blur-sm bg-white/30 shadow-sm rounded-lg p-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{name}</span>
                  <span className="text-xl font-bold text-gray-700">
                    {data.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
