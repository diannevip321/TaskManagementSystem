import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    MenuItem,
    Select,
  } from "@mui/material";
  import DeleteIcon from "@mui/icons-material/Delete";
  import type { Task, TaskStatus } from "../api/tasksApi";
  
  interface TaskListProps {
    tasks: Task[];
    onUpdateStatus: (taskId: string, status: TaskStatus) => void;
    onDeleteTask: (taskId: string) => void;
  }
  
  export default function TaskList({
    tasks,
    onUpdateStatus,
    onDeleteTask,
  }: TaskListProps) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your tasks
        </Typography>
  
        {tasks.map((task) => (
          <Card key={task.taskId} elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={600}>
                  {task.title}
                </Typography>
  
                <Typography
                  variant="body2"
                  sx={{
                    bgcolor: "#eee",
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  {task.status === "todo"
                    ? "To do"
                    : task.status === "in-progress"
                    ? "In progress"
                    : "Done"}
                </Typography>
              </Box>
  
              <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                {task.description}
              </Typography>
  
              <Typography variant="caption" display="block">
                Created: {new Date(task.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                Updated: {new Date(task.updatedAt).toLocaleString()}
              </Typography>
  
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Select
                  size="small"
                  value={task.status}
                  onChange={(e) =>
                    onUpdateStatus(task.taskId, e.target.value as TaskStatus)
                  }
                >
                  <MenuItem value="todo">To do</MenuItem>
                  <MenuItem value="in-progress">In progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
  
                <IconButton color="error" onClick={() => onDeleteTask(task.taskId)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }
  