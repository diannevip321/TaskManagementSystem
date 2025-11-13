// src/handlers/tasksHandler.js
// Main Lambda handler for task CRUD operations.

const { ddb } = require("../utils/dbClient");
const { jsonResponse } = require("../utils/responses");
const {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const TASKS_TABLE = process.env.TASKS_TABLE || "Tasks";
const DEMO_USER_ID = "demo-user";

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const method = event.requestContext?.http?.method;
  const rawPath = event.requestContext?.http?.path || "";
  const pathParams = event.pathParameters || {};
  const taskId = pathParams.taskId;

  try {
    if (method === "OPTIONS") {
      return jsonResponse(200, null);
    }

    if (method === "GET" && rawPath.endsWith("/tasks")) {
      return await listTasks();
    }

    if (method === "POST" && rawPath.endsWith("/tasks")) {
      const body = JSON.parse(event.body || "{}");
      return await createTask(body);
    }

    if (method === "PUT" && rawPath.includes("/tasks/") && taskId) {
      const body = JSON.parse(event.body || "{}");
      return await updateTask(taskId, body);
    }

    if (method === "DELETE" && rawPath.includes("/tasks/") && taskId) {
      return await deleteTask(taskId);
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (err) {
    console.error("Error in handler:", err);
    return jsonResponse(500, {
      error: "Internal Server Error",
      details: String(err),
    });
  }
};

async function listTasks() {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TASKS_TABLE,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: {
        ":u": DEMO_USER_ID,
      },
    })
  );

  return jsonResponse(200, result.Items || []);
}

async function createTask(body) {
  const now = new Date().toISOString();

  const item = {
    userId: DEMO_USER_ID,
    taskId: uuidv4(),
    title: body.title || "Untitled task",
    description: body.description || "",
    status: "todo", // todo | in-progress | done
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: TASKS_TABLE,
      Item: item,
    })
  );

  return jsonResponse(201, item);
}

async function updateTask(taskId, body) {
  const now = new Date().toISOString();
  const updateExpressions = [];
  const expressionValues = {
    ":u": DEMO_USER_ID,
    ":t": taskId,
    ":updatedAt": now,
  };

  if (body.title !== undefined) {
    updateExpressions.push("title = :title");
    expressionValues[":title"] = body.title;
  }
  if (body.description !== undefined) {
    updateExpressions.push("description = :description");
    expressionValues[":description"] = body.description;
  }
  if (body.status !== undefined) {
    updateExpressions.push("status = :status");
    expressionValues[":status"] = body.status;
  }

  updateExpressions.push("updatedAt = :updatedAt");

  const result = await ddb.send(
    new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: {
        userId: DEMO_USER_ID,
        taskId,
      },
      UpdateExpression: "SET " + updateExpressions.join(", "),
      ExpressionAttributeValues: expressionValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return jsonResponse(200, result.Attributes);
}

async function deleteTask(taskId) {
  await ddb.send(
    new DeleteCommand({
      TableName: TASKS_TABLE,
      Key: {
        userId: DEMO_USER_ID,
        taskId,
      },
    })
  );

  return jsonResponse(204, null);
}

