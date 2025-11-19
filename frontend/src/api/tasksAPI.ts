import { CONFIG } from "../config";
import { ACCESS_TOKEN_KEY } from "../auth/auth";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  userId: string;
  taskId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = CONFIG.API_BASE_URL;

function getAccessToken(): string {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error("No access token available. Are you logged in?");
  }
  return token;
}

function buildAuthHeaders() {
  const token = getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getTasks(): Promise<Task[]> {
  if (!BASE_URL) {
    throw new Error("CONFIG.API_BASE_URL is not set.");
  }
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });
  return handleJson<Task[]>(res);
}

export async function createTask(input: {
  title: string;
  description?: string;
}): Promise<Task> {
  if (!BASE_URL) {
    throw new Error("CONFIG.API_BASE_URL is not set.");
  }
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      title: input.title,
      description: input.description ?? "",
      status: "todo",
    }),
  });
  return handleJson<Task>(res);
}

export async function updateTask(
  taskId: string,
  partial: Partial<Pick<Task, "title" | "description" | "status">>
): Promise<Task> {
  if (!BASE_URL) {
    throw new Error("CONFIG.API_BASE_URL is not set.");
  }
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(partial),
  });
  return handleJson<Task>(res);
}

export async function deleteTask(taskId: string): Promise<void> {
  if (!BASE_URL) {
    throw new Error("CONFIG.API_BASE_URL is not set.");
  }
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed with ${res.status}`);
  }
}