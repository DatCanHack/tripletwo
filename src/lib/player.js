// src/lib/player.js
const KEY = "fitx:progress";

const loadAll = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

const saveAll = (obj) => localStorage.setItem(KEY, JSON.stringify(obj));

export const getProgress = (lessonId) => loadAll()[lessonId] || null;

export const saveTime = (lessonId, time, duration) => {
  const all = loadAll();
  all[lessonId] = {
    ...(all[lessonId] || {}),
    time,
    duration,
    updatedAt: Date.now(),
  };
  saveAll(all);
};

export const markCompleted = (lessonId) => {
  const all = loadAll();
  all[lessonId] = {
    ...(all[lessonId] || {}),
    finished: true,
    updatedAt: Date.now(),
  };
  saveAll(all);
};

export const clearProgress = (lessonId) => {
  const all = loadAll();
  delete all[lessonId];
  saveAll(all);
};

export const setLastWatched = (lessonId) => {
  const all = loadAll();
  all.__last__ = lessonId;
  saveAll(all);
};
export const getLastWatched = () => loadAll().__last__ || null;
