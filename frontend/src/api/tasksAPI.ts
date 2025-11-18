// src/api/tasksApi.ts
import { CONFIG } from "../config";

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

// Helper to handle responses
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
  const res = await fetch(`${BASE_URL}/tasks`);
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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed with ${res.status}`);
  }
}
