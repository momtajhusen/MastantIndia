
// =======================
// services/workSessions.js
// =======================
import apiClient from './apiClient';

/* =======================
   WORK SESSIONS
======================= */

export const startWorkSession = (data) => {
  return apiClient.post('/worker/work-sessions/start', data);
};

export const endWorkSession = (data) => {
  return apiClient.post('/worker/work-sessions/end', data);
};

export const takeBreak = (data) => {
  return apiClient.post('/worker/work-sessions/break', data);
};

export const resumeWork = (data) => {
  return apiClient.post('/worker/work-sessions/resume', data);
};
