import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

interface TaskFormProps {
  onCreateTask: (title: string, description: string) => void;
}

export default function TaskForm({ onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreateTask(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create a new task
        </Typography>

        <TextField
          label="Title"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          minRows={3}
          sx={{ mb: 2 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box textAlign="right">
          <Button variant="contained" onClick={handleSubmit}>
            Add Task
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
