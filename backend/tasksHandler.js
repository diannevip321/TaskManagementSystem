const { ddb } = require("./dbClient");
const { jsonResponse } = require("./responses");
const crypto = require("crypto");

const TASKS_TABLE = process.env.TASKS_TABLE || "Tasks";
const DEMO_USER_ID = "demo-user";
const ALLOWED_STATUSES = ["todo", "in-progress", "done"];

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
  const params = {
    TableName: TASKS_TABLE,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: {
      ":u": DEMO_USER_ID,
    },
  };

  const result = await ddb.query(params).promise();
  return jsonResponse(200, result.Items || []);
}

async function createTask(body) {
  const now = new Date().toISOString();

  const title = body.title || "Untitled task";
  const description = body.description || "";
  const status = ALLOWED_STATUSES.includes(body.status)
    ? body.status
    : "todo";

  const item = {
    userId: DEMO_USER_ID,
    taskId: crypto.randomUUID(),
    title,
    description,
    status,
    createdAt: now,
    updatedAt: now,
  };

  const params = {
    TableName: TASKS_TABLE,
    Item: item,
  };

  await ddb.put(params).promise();
  return jsonResponse(201, item);
}

async function updateTask(taskId, body) {
  const now = new Date().toISOString();

  const updateExpressions = [];
  const expressionValues = {
    ":updatedAt": now,
  };
  const expressionNames = {};

  if (body.title !== undefined) {
    updateExpressions.push("title = :title");
    expressionValues[":title"] = body.title;
  }

  if (body.description !== undefined) {
    updateExpressions.push("description = :description");
    expressionValues[":description"] = body.description;
  }

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return jsonResponse(400, {
        error: "Invalid status",
        allowed: ALLOWED_STATUSES,
      });
    }

    updateExpressions.push("#status = :status");
    expressionValues[":status"] = body.status;
    expressionNames["#status"] = "status";
  }

  updateExpressions.push("updatedAt = :updatedAt");

  if (updateExpressions.length === 1) {
    return jsonResponse(400, {
      error: "No updatable fields provided",
    });
  }

  const params = {
    TableName: TASKS_TABLE,
    Key: {
      userId: DEMO_USER_ID,
      taskId,
    },
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW",
  };

  if (Object.keys(expressionNames).length > 0) {
    params.ExpressionAttributeNames = expressionNames;
  }

  const result = await ddb.update(params).promise();
  return jsonResponse(200, result.Attributes);
}

async function deleteTask(taskId) {
  const params = {
    TableName: TASKS_TABLE,
    Key: {
      userId: DEMO_USER_ID,
      taskId,
    },
  };

  await ddb.delete(params).promise();
  return jsonResponse(204, null);
}

