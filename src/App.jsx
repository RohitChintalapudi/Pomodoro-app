import React, { useEffect, useRef, useState } from "react";

function App() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusTime, setIsFocusTime] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [effectTrigger, setEffectTrigger] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const transitioningRef = useRef(false);
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft((isFocusTime ? focusMinutes : breakMinutes) * 60);
    }
  }, [focusMinutes, breakMinutes, isFocusTime, isRunning]);

  useEffect(() => {
    if (isRunning && intervalRef.current == null) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 0) return 0; 
          return prev - 1;
        });
      }, 1000);
    }
    if (!isRunning && intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft > 0) return;
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isFocusTime) {
      setSessionCount((c) => c + 1);
      setEffectTrigger(true);
      timeoutRef.current = setTimeout(() => {
        setEffectTrigger(false);
        setIsFocusTime(false); 
        setSecondsLeft(breakMinutes * 60);
        setIsRunning(false); 
        transitioningRef.current = false;
        timeoutRef.current = null;
      }, 600);
    } else {
      setIsFocusTime(true);
      setSecondsLeft(focusMinutes * 60);
      setIsRunning(false);
      transitioningRef.current = false;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      transitioningRef.current = false;
    };
  }, [secondsLeft, isFocusTime, breakMinutes, focusMinutes, isRunning]);

  const formatTime = (totalSeconds) => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (safe % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleStart = () => {
    if (isRunning) return;
    if (secondsLeft === 0) {
      setSecondsLeft((isFocusTime ? focusMinutes : breakMinutes) * 60);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setEffectTrigger(false);
    setIsFocusTime(true); 
    setSessionCount(0);
    setSecondsLeft(focusMinutes * 60);
    transitioningRef.current = false;
  };

  const switchToFocus = () => {
    if (isRunning) return;
    setIsFocusTime(true);
    setSecondsLeft(focusMinutes * 60);
    setEffectTrigger(false);
  };

  const switchToBreak = () => {
    if (isRunning) return;
    setIsFocusTime(false);
    setSecondsLeft(breakMinutes * 60);
    setEffectTrigger(false);
  };

  return (
    <div className="app">
      <h1>Pomodoro Timer</h1>

      <div className="mode-buttons" style={{ marginBottom: 20 }}>
        <button onClick={switchToFocus} disabled={isRunning}>
          Focus Mode
        </button>
        <button onClick={switchToBreak} disabled={isRunning}>
          Break Mode
        </button>
      </div>

      <div className="input-group">
        <label>
          Focus (minutes):
          <input
            type="number"
            min="1"
            max="120"
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(Number(e.target.value))}
            disabled={isRunning}
          />
        </label>
        <label>
          Break (minutes):
          <input
            type="number"
            min="1"
            max="60"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
            disabled={isRunning}
          />
        </label>
      </div>

      <div className={`timer ${effectTrigger ? "fade-out" : ""}`}>
        <span className="time">{formatTime(secondsLeft)}</span>
        <span className="mode">{isFocusTime ? "Focus" : "Break"}</span>
      </div>

      <div className="session-count">
        Sessions completed 🔥: <strong>{sessionCount}</strong>
      </div>

      <div className="controls">
        <button onClick={handleStart} disabled={isRunning && secondsLeft > 0}>
          Start
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default App;
