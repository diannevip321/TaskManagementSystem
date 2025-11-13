const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-2";

const baseClient = new DynamoDBClient({ region: REGION });

const ddb = DynamoDBDocumentClient.from(baseClient);

module.exports = {
  ddb,
  REGION,
};
