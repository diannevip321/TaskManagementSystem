import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

import { buildLoginUrl, buildLogoutUrl } from "./auth/auth";
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
  const [authCode] = useState<string | null>(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }
    return code;
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!authCode) return;

    async function load() {
      const data = await getTasks();
      setTasks(data);
    }

    load();
  }, [authCode]);

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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            TMS – Task Management System
          </Typography>

          {authCode && (
            <Button
              color="inherit"
              onClick={() => (window.location.href = buildLogoutUrl())}
            >
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
          alignItems: authCode ? "flex-start" : "center",
          p: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1100,
          }}
        >
          {!authCode ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Not logged in. Please log in through Cognito.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => (window.location.href = buildLoginUrl())}
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
