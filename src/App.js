import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const CAT_COUNT = 10;

function getCatUrls(count) {
  return Array.from({ length: count }, (_, i) => `https://cataas.com/cat?${i}&width=400&height=400`);
}

function App() {
  const [cats, setCats] = useState([]);
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState([]);
  const [finished, setFinished] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    setCats(getCatUrls(CAT_COUNT));
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUpWindow);
    };
    // eslint-disable-next-line
  }, []);

  // --- Touch events ---
  const handleTouchStart = (e) => {
    if (isDragging) return;
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    setDragX(diff);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    finishDrag(diff);
    touchStartX.current = null;
  };

  // --- Mouse events ---
  function handleMouseDown(e) {
    if (isDragging) return;
    mouseStartX.current = e.clientX;
    dragging.current = true;
    setIsDragging(true);
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUpWindow);
  }

  function handleMouseMove(e) {
    if (!dragging.current || mouseStartX.current === null) return;
    const diff = e.clientX - mouseStartX.current;
    setDragX(diff);
  }

  function handleMouseUpWindow(e) {
    if (!dragging.current || mouseStartX.current === null) return;
    const diff = e.clientX - mouseStartX.current;
    finishDrag(diff);
    mouseStartX.current = null;
    dragging.current = false;
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUpWindow);
  }

  // --- Shared drag finish logic ---
  function finishDrag(diff) {
    setIsDragging(false);
    if (diff > 50) {
      setTimeout(() => handleSwipe(true), 100); // allow animation
      setDragX(400);
    } else if (diff < -50) {
      setTimeout(() => handleSwipe(false), 100);
      setDragX(-400);
    } else {
      setDragX(0); // Snap back
    }
  }

  // --- Swipe logic ---
  const handleSwipe = (like) => {
    setDragX(0);
    setIsDragging(false);
    if (like) setLiked((prev) => [...prev, cats[current]]);
    if (current + 1 < cats.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  // --- UI ---
  if (finished) {
    return (
      <div className="container">
        <h2>You liked {liked.length} out of {cats.length} cats!</h2>
        <div className="grid">
          {liked.map((url, i) => (
            <img key={i} src={url} alt="Liked cat" className="catThumb" />
          ))}
        </div>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>
        <span role="img" aria-label="cat">🐾</span> Paws & Preferences
      </h1>
      <div
        className={`card${isDragging ? " dragging" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 20}deg) scale(${isDragging ? 1.04 : 1})`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(.22,1.61,.36,1)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {cats.length > 0 && (
          <img
            src={cats[current]}
            alt="Cat"
            className="catImg"
            draggable={false}
          />
        )}
        {isDragging && Math.abs(dragX) > 20 && (
          <div
            className={`swipe-indicator ${dragX > 0 ? "like-indicator" : "dislike-indicator"}`}
            style={{ opacity: Math.min(Math.abs(dragX) / 80, 1) }}
          >
            {dragX > 0 ? "❤️ Like" : "❌ Nope"}
          </div>
        )}
      </div>
      <div className="buttons">
        <button onClick={() => handleSwipe(false)} className="dislike">Dislike</button>
        <button onClick={() => handleSwipe(true)} className="like">Like</button>
      </div>
      <p>{current + 1} / {cats.length}</p>
      <p>Swipe left/right or use buttons</p>
    </div>
  );
}

export default App;