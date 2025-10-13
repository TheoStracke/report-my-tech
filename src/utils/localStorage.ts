import { Attendance } from "@/types/attendance";

const STORAGE_KEY = "theo-stracke-attendance-records";

export const loadAttendances = (): Attendance[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao carregar atendimentos:", error);
    return [];
  }
};

export const saveAttendances = (attendances: Attendance[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendances));
  } catch (error) {
    console.error("Erro ao salvar atendimentos:", error);
  }
};

export const addAttendance = (attendance: Attendance): void => {
  const attendances = loadAttendances();
  attendances.push(attendance);
  saveAttendances(attendances);
};

export const updateAttendance = (id: string, updatedAttendance: Attendance): void => {
  const attendances = loadAttendances();
  const index = attendances.findIndex((a) => a.id === id);
  if (index !== -1) {
    attendances[index] = updatedAttendance;
    saveAttendances(attendances);
  }
};

export const deleteAttendance = (id: string): void => {
  const attendances = loadAttendances();
  const filtered = attendances.filter((a) => a.id !== id);
  saveAttendances(filtered);
};

export const getTodayAttendances = (): Attendance[] => {
  const attendances = loadAttendances();
  const today = new Date().toISOString().split("T")[0];
  return attendances.filter((a) => a.date === today);
};
