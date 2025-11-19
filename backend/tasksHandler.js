const { ddb } = require("./dbClient");
const { jsonResponse } = require("./responses");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const TASKS_TABLE = process.env.TASKS_TABLE || "Tasks";
const ALLOWED_STATUSES = ["todo", "in-progress", "done"];

function getUserIdFromEvent(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }
  const token = authHeader.substring("Bearer ".length);
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !decoded.sub) {
    throw new Error("Missing user identity in token");
  }
  return decoded.sub;
}

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method;
  const rawPath = event.requestContext?.http?.path || "";
  const pathParams = event.pathParameters || {};
  const taskId = pathParams.taskId;

  try {
    if (method === "OPTIONS") {
      return jsonResponse(200, null);
    }

    let userId;
    try {
      userId = getUserIdFromEvent(event);
    } catch (err) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    if (method === "GET" && rawPath.endsWith("/tasks")) {
      return await listTasks(userId);
    }

    if (method === "POST" && rawPath.endsWith("/tasks")) {
      const body = JSON.parse(event.body || "{}");
      return await createTask(userId, body);
    }

    if (method === "PUT" && rawPath.includes("/tasks/") && taskId) {
      const body = JSON.parse(event.body || "{}");
      return await updateTask(userId, taskId, body);
    }

    if (method === "DELETE" && rawPath.includes("/tasks/") && taskId) {
      return await deleteTask(userId, taskId);
    }

    return jsonResponse(404, { error: "Not found" });
  } catch (err) {
    return jsonResponse(500, { error: "Internal Server Error", details: String(err) });
  }
};

async function listTasks(userId) {
  const params = {
    TableName: TASKS_TABLE,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId }
  };
  const result = await ddb.query(params).promise();
  return jsonResponse(200, result.Items || []);
}

async function createTask(userId, body) {
  const now = new Date().toISOString();
  const title = body.title || "Untitled task";
  const description = body.description || "";
  const status = ALLOWED_STATUSES.includes(body.status) ? body.status : "todo";

  const item = {
    userId,
    taskId: crypto.randomUUID(),
    title,
    description,
    status,
    createdAt: now,
    updatedAt: now
  };

  await ddb.put({ TableName: TASKS_TABLE, Item: item }).promise();
  return jsonResponse(201, item);
}

async function updateTask(userId, taskId, body) {
  const now = new Date().toISOString();
  const updateExpressions = [];
  const expressionValues = { ":updatedAt": now };
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
      return jsonResponse(400, { error: "Invalid status", allowed: ALLOWED_STATUSES });
    }
    updateExpressions.push("#status = :status");
    expressionValues[":status"] = body.status;
    expressionNames["#status"] = "status";
  }

  updateExpressions.push("updatedAt = :updatedAt");

  if (updateExpressions.length === 1) {
    return jsonResponse(400, { error: "No updatable fields provided" });
  }

  const params = {
    TableName: TASKS_TABLE,
    Key: { userId, taskId },
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionValues,
    ReturnValues: "ALL_NEW"
  };

  if (Object.keys(expressionNames).length > 0) {
    params.ExpressionAttributeNames = expressionNames;
  }

  const result = await ddb.update(params).promise();
  return jsonResponse(200, result.Attributes);
}

async function deleteTask(userId, taskId) {
  await ddb.delete({
    TableName: TASKS_TABLE,
    Key: { userId, taskId }
  }).promise();

  return jsonResponse(204, null);
}