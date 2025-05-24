# Deployment Guide - Credentials Management

## Local Development

**Use `.env` file:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

Your `.env` file should contain:
```env
WHATSAPP_ACCESS_TOKEN=your_actual_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
DATABASE_PASSWORD=your_db_password
```

⚠️ **Never commit `.env` to git** (already in `.gitignore`)

---

## Production Deployment

### Option 1: AWS Systems Manager (SSM) Parameter Store ⭐ **RECOMMENDED**

**Benefits:**
- ✅ Encrypted storage
- ✅ Fine-grained access control
- ✅ Audit logging
- ✅ Version history
- ✅ Free for standard parameters

**Setup:**
```bash
# Store secrets in SSM Parameter Store
aws ssm put-parameter \
  --name "/whatsapp-mcp/whatsapp-access-token" \
  --value "your_actual_token" \
  --type "SecureString" \
  --description "WhatsApp Access Token"

aws ssm put-parameter \
  --name "/whatsapp-mcp/database-password" \
  --value "your_db_password" \
  --type "SecureString"
```

**EC2 IAM Role Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": [
        "arn:aws:ssm:*:*:parameter/whatsapp-mcp/*"
      ]
    }
  ]
}
```

**Container Environment:**
```bash
# Only set non-sensitive config
SERVER_PORT=3000
NODE_ENV=production
WHATSAPP_API_VERSION=v21.0
AWS_REGION=us-east-1

# Secrets fetched from SSM at runtime
```

---

### Option 2: Environment Variables (Simple)

**For basic deployments:**
```bash
# Set environment variables on EC2
export WHATSAPP_ACCESS_TOKEN="your_token"
export DATABASE_PASSWORD="your_password"

# Or use Docker secrets
docker run -e WHATSAPP_ACCESS_TOKEN="your_token" whatsapp-mcp
```

**Security concerns:**
- ⚠️ Visible in process lists
- ⚠️ May appear in logs
- ⚠️ No encryption at rest

---

### Option 3: Docker Secrets (Docker Swarm)

**For Docker Swarm deployments:**
```bash
# Create secrets
echo "your_token" | docker secret create whatsapp_token -
echo "your_password" | docker secret create db_password -

# Use in docker-compose.yml
version: '3.8'
services:
  app:
    image: whatsapp-mcp
    secrets:
      - whatsapp_token
      - db_password
secrets:
  whatsapp_token:
    external: true
  db_password:
    external: true
```

---

### Option 4: AWS Secrets Manager

**For enterprise deployments:**
```bash
# Create secret
aws secretsmanager create-secret \
  --name "whatsapp-mcp/credentials" \
  --secret-string '{"whatsapp_token":"your_token","db_password":"your_password"}'
```

**Costs:** ~$0.40/month per secret

---

## Security Best Practices

### ✅ Do:
- Use IAM roles instead of access keys on EC2
- Rotate credentials regularly
- Use least-privilege access
- Enable CloudTrail for audit logs
- Use different credentials for dev/staging/prod

### ❌ Don't:
- Hardcode credentials in source code
- Commit `.env` files to git
- Use the same credentials across environments
- Store credentials in container images
- Use overly broad IAM policies

---

## Quick Start Commands

**Local:**
```bash
cp .env.example .env
# Edit .env
docker-compose up
```

**Production (SSM):**
```bash
# Store secrets in SSM
aws ssm put-parameter --name "/whatsapp-mcp/whatsapp-access-token" --value "token" --type "SecureString"

# Deploy with IAM role
docker run --env-file production.env whatsapp-mcp
```

**Production (Simple):**
```bash
docker run \
  -e WHATSAPP_ACCESS_TOKEN="your_token" \
  -e DATABASE_PASSWORD="your_password" \
  -p 3000:3000 \
  whatsapp-mcp
```