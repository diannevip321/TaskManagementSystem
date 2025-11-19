import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";

import {
  startLogin,
  buildLogoutUrl,
  clearTokens,
  ACCESS_TOKEN_KEY,
  exchangeCodeForTokens,
} from "./auth/auth";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./api/tasksApi";

import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import type { Task, TaskStatus } from "./api/tasksApi";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!sessionStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const [authProcessing, setAuthProcessing] = useState<boolean>(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCode() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      const alreadyHaveToken = !!sessionStorage.getItem(ACCESS_TOKEN_KEY);

      if (alreadyHaveToken) {
        if (code) {
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());
        }
        setIsLoggedIn(true);
        setAuthProcessing(false);
        return;
      }

      if (!code) {
        setAuthProcessing(false);
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code);
        console.log("Tokens received:", tokens);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Token exchange failed", err);
        alert("Login failed during token exchange. See console for details.");
      } finally {
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.toString());
        setAuthProcessing(false);
      }
    }

    handleAuthCode().catch((err) =>
      console.error("Unexpected error handling auth code:", err)
    );
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function load() {
      setLoadingTasks(true);
      setLoadError(null);
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err: any) {
        console.error("Failed to load tasks", err);
        setLoadError(err?.message ?? "Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    }

    load();
  }, [isLoggedIn]);

  const handleCreateTask = async (title: string, description: string) => {
    const newTask = await createTask({ title, description });
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    const updated = await updateTask(taskId, { status });
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  };

  const handleLogoutClick = () => {
    clearTokens();
    setIsLoggedIn(false);
    window.location.href = buildLogoutUrl();
  };

  //
  // Render
  //
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TMS – Task Management System
          </Typography>

          {isLoggedIn && (
            <Button color="inherit" onClick={handleLogoutClick}>
              LOGOUT
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          bgcolor: "#f5f7fb",
          display: "flex",
          justifyContent: "center",
          alignItems: isLoggedIn ? "flex-start" : "center",
          p: 4,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1100 }}>
          {authProcessing ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Signing you in…
              </Typography>
              <Typography variant="body2">
                Please wait while we complete login.
              </Typography>
            </Box>
          ) : !isLoggedIn ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Not logged in. Please log in through Cognito.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  startLogin().catch((err) => {
                    console.error("Failed to start login", err);
                    alert("Could not start login. See console for details.");
                  });
                }}
              >
                Login with Cognito
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flexBasis: { xs: "100%", md: "40%" }, flexGrow: 1 }}>
                <TaskForm onCreateTask={handleCreateTask} />
              </Box>

              <Box sx={{ flexBasis: { xs: "100%", md: "60%" }, flexGrow: 1 }}>
                {loadingTasks && (
                  <Typography sx={{ mb: 2 }}>Loading tasks…</Typography>
                )}
                {loadError && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {loadError}
                  </Typography>
                )}
                <TaskList
                  tasks={tasks}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteTask={handleDeleteTask}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default App;