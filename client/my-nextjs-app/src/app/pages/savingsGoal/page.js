import React, { useState } from "react";
import "./SavingsGoals.css"; // Add CSS for styling

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    dateRange: "",
    savedAmount: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.dateRange) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    const updatedGoals = [...goals, { ...newGoal, id: Date.now() }];
    setGoals(updatedGoals);
    setNewGoal({ name: "", targetAmount: "", dateRange: "", savedAmount: 0 });
    setErrorMessage("");
  };

  const handleUpdateSavedAmount = (id, amount) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id
        ? {
            ...goal,
            savedAmount: Math.min(
              parseFloat(goal.savedAmount) + parseFloat(amount),
              parseFloat(goal.targetAmount)
            ),
          }
        : goal
    );
    setGoals(updatedGoals);
  };

  const calculateMilestones = (targetAmount) => {
    const milestones = [];
    const milestoneStep = targetAmount / 4; // Divide into 4 milestones
    for (let i = 1; i <= 4; i++) {
      milestones.push(i * milestoneStep);
    }
    return milestones;
  };

  return (
    <div className="savings-goals-container">
      <h1>Savings Goals</h1>
      <div className="add-goal-form">
        <h2>Create a Savings Goal</h2>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Goal Name (e.g., Vacation)"
          value={newGoal.name}
          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target Amount (e.g., 5000)"
          value={newGoal.targetAmount}
          onChange={(e) =>
            setNewGoal({ ...newGoal, targetAmount: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Date Range (e.g., 6 months)"
          value={newGoal.dateRange}
          onChange={(e) =>
            setNewGoal({ ...newGoal, dateRange: e.target.value })
          }
        />
        <button onClick={handleAddGoal}>Add Goal</button>
      </div>

      <div className="goals-list">
        <h2>Your Savings Goals</h2>
        {goals.length === 0 ? (
          <p>No savings goals yet. Start by adding one above!</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <h3>{goal.name}</h3>
              <p>
                Target Amount: ${goal.targetAmount} | Saved: $
                {goal.savedAmount.toFixed(2)}
              </p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${
                      (goal.savedAmount / goal.targetAmount) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p>
                Progress:{" "}
                {Math.min(
                  ((goal.savedAmount / goal.targetAmount) * 100).toFixed(2),
                  100
                )}
                %
              </p>

              {/* Milestones */}
              <div className="milestones">
                <h4>Milestones:</h4>
                <ul>
                  {calculateMilestones(goal.targetAmount).map((milestone, index) => (
                    <li
                      key={index}
                      style={{
                        color:
                          goal.savedAmount >= milestone ? "green" : "gray",
                      }}
                    >
                      ${milestone.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Update Savings */}
              <div className="update-saved">
                <input
                  type="number"
                  placeholder="Add Amount"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateSavedAmount(goal.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
