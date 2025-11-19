# TaskManagementSystem

A Task Management System built using AWS Cognito, API Gateway, Lambda, DynamoDB, S3, and CloudFront.  
The application supports authenticated users, secure task storage, and a modern React/TypeScript frontend deployed globally.

**Live URL:**  
https://d2eh85y3y3ci4n.cloudfront.net

Anyone with this URL can sign up and use the application.

---

## Features

- **Authenticated Login Flow**  
  Uses Amazon Cognito Hosted UI with the Authorization Code flow and PKCE.

- **Serverless Backend**  
  CRUD operations for tasks handled entirely through AWS Lambda.

- **Per-User Task Storage**  
  Each authenticated user has an isolated task list stored in DynamoDB keyed by their unique user ID.

- **REST API Integration**  
  The frontend communicates with API Gateway using secure JWT access tokens.

- **Production Deployment**  
  React app hosted on S3 and distributed via CloudFront for global low-latency access.

---

## Authentication Flow

1. User clicks **Login**.  
2. Redirect to Cognito Hosted Login Page.  
3. After successful sign-in, Cognito redirects back to:  
   ```
   https://d2eh85y3y3ci4n.cloudfront.net
   ```
4. The frontend exchanges the authorization code for tokens.  
5. All API requests use:  
   ```
   Authorization: Bearer <token>
   ```

---

## API Endpoints (Protected)

All endpoints require a valid Cognito access token.

### GET /tasks  
Returns all tasks for the authenticated user.

### POST /tasks  
Creates a new task with title and description.

### PUT /tasks/{taskId}  
Updates a task’s status, title, or description.

### DELETE /tasks/{taskId}  
Deletes a specific task.

---

## Deployment Summary

### Frontend Deployment
- Built with Vite (React + TypeScript).  
- Deployed by uploading the `dist/` build folder to an S3 bucket configured for static hosting.  
- Served publicly via CloudFront distribution.

### Backend Deployment
- Node.js Lambda function with CRUD logic.  
- DynamoDB table storing tasks keyed by:  
  ```
  userId (PK), taskId (SK)
  ```
- API exposed through API Gateway.  
- CORS configured to allow CloudFront domain.

---

## Future Improvements

- **Add Pagination & Query Filters**  
  For large numbers of tasks, add pagination, status filters, and search.

- **Improved Error Handling**  
  Provide user-friendly error messages and surface backend validation errors more clearly.

- **Implement CI/CD Pipeline**  
  Automate deployments using GitHub Actions or AWS CodePipeline for both frontend and backend.

- **Add Unit and Integration Tests**  
  Jest tests for frontend components and integration tests for Lambda functions.

## Author

Built by Dianne — Stony Brook University Computer Science  