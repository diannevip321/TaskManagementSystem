const ALLOWED_ORIGIN = "http://localhost:5173";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: body !== undefined && body !== null ? JSON.stringify(body) : "",
  };
}

module.exports = {
  jsonResponse,
};
