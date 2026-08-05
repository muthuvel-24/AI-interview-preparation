# AWS Deployment Guide — AI Interview Preparation Platform

This guide outlines the production deployment steps for the AI Interview Preparation Platform on Amazon Web Services (AWS).

---

## Architecture Overview

```
[User Browser]
      │
      ├── (HTTPS / CDN) ────────► AWS CloudFront + Route 53 ──► Next.js Frontend (Vercel / AWS Amplify)
      │
      └── (REST API / CORS) ────► AWS API Gateway / EC2 ────► Express Backend Docker Container
                                                                 │
                                                                 ├──► AWS RDS PostgreSQL
                                                                 ├──► AWS S3 (Resumes)
                                                                 └──► AWS Lambda (Async AI Jobs)
```

---

## 1. Database Setup: AWS RDS PostgreSQL

1. Go to AWS RDS Console -> **Create Database**.
2. Select **PostgreSQL 16**.
3. Choose **Free Tier / Standard Create**.
4. Configure DB Instance Identifier: `interview-prep-db`.
5. Set master username (`postgres`) and master password.
6. Under Connectivity, select your VPC and enable **Publicly Accessible** if needed for migration scripts, or keep private inside VPC.
7. Note down the Endpoint string: `interview-prep-db.xxx.ap-south-1.rds.amazonaws.com`.
8. Update backend `.env` or EC2 environment variables:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@interview-prep-db.xxx.ap-south-1.rds.amazonaws.com:5432/interview_prep
   ```
9. Run database migrations:
   ```bash
   cd backend
   npx prisma db push
   ```

---

## 2. File Storage: AWS S3 Bucket

1. Go to AWS S3 Console -> **Create Bucket**.
2. Bucket Name: `interview-prep-resumes`.
3. Region: `ap-south-1` (Mumbai) or your preferred region.
4. Block Public Access: Uncheck if direct reading is required, or use pre-signed URLs (recommended).
5. Configure CORS Policy on S3 bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

---

## 3. Backend Deployment: AWS EC2 (Dockerized)

1. Launch an **AWS EC2 Instance** (Ubuntu 22.04 LTS, t3.small or t3.medium).
2. Configure Security Group: Open inbound ports `22` (SSH), `80` (HTTP), `443` (HTTPS), and `5000` (Backend API).
3. SSH into EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```
4. Install Docker & Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   sudo systemctl enable docker
   ```
5. Clone repository and run docker compose:
   ```bash
   git clone <your-repo-url>
   cd ai-interview-preparation
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

---

## 4. Frontend Deployment: CloudFront + Route 53

1. Build Next.js application:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy to AWS Amplify / Vercel / CloudFront S3 static website hosting.
3. Configure Route 53 domain DNS record pointing to CloudFront Distribution domain.
4. Set `NEXT_PUBLIC_API_URL` to point to your EC2 or API Gateway domain.

---

## 5. CloudWatch Logging & Alarms

1. Attach CloudWatch Logs agent to EC2 container logs.
2. Set up metric alarms for:
   - CPU Utilization > 80%
   - HTTP 5xx Server Error count > 10 in 5 minutes
