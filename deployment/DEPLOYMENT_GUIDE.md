# AWS ECS Fargate Deployment Guide for Notes App

## Overview

This guide provides step-by-step instructions to deploy the Notes App (frontend, auth-service, and notes-service) to AWS ECS Fargate. The deployment includes:

- **Container Registry**: Amazon ECR for storing Docker images
- **Container Orchestration**: Amazon ECS Fargate (serverless containers)
- **Databases**: Amazon RDS PostgreSQL for auth and notes services
- **Load Balancing**: Application Load Balancer (ALB) for routing traffic
- **Networking**: VPC with public and private subnets
- **Logging**: CloudWatch Logs for centralized logging
- **IAM**: Roles and policies for secure access

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
   ```bash
   aws --version
   aws configure
   ```
3. **Docker**: Installed and running
   ```bash
   docker --version
   ```
4. **Git**: For version control
5. **Bash**: For running deployment scripts

## Quick Start

### Step 1: Prepare Your Environment

```bash
# Navigate to the project directory
cd /path/to/notes-app

# Make deployment scripts executable
chmod +x deployment/*.sh

# Set AWS region (optional, defaults to us-east-1)
export AWS_REGION=us-east-1
```

### Step 2: Create IAM Roles and Policies

```bash
./deployment/setup-iam.sh
source ./deployment/iam-outputs.sh
```

This script creates:
- `ecsTaskExecutionRole`: Allows ECS to pull images from ECR and write logs to CloudWatch
- `ecsTaskRole`: Allows containers to access S3, RDS, and Secrets Manager
- `codeBuildRole`: For future CI/CD integration

### Step 3: Set Up VPC and Networking

```bash
./deployment/setup-vpc.sh
source ./deployment/vpc-outputs.sh
```

This script creates:
- VPC with CIDR block 10.0.0.0/16
- 2 Public subnets (10.0.10.0/24, 10.0.11.0/24)
- 2 Private subnets (10.0.1.0/24, 10.0.2.0/24)
- Internet Gateway and route tables
- Security groups for ALB, ECS, and RDS

### Step 4: Create Application Load Balancer

```bash
./deployment/setup-alb.sh
source ./deployment/alb-outputs.sh
```

This script creates:
- Application Load Balancer
- Target groups for frontend, auth, and notes services
- Listener rules for path-based routing

### Step 5: Deploy to ECS Fargate

```bash
# Choose environment: dev or prod
export ENVIRONMENT=dev

# Run the main deployment script
./deploy-to-aws.sh --environment $ENVIRONMENT --region $AWS_REGION

# Deploy services
./deployment/deploy-services.sh
```

This script:
- Creates ECR repositories
- Builds and pushes Docker images
- Creates ECS cluster
- Creates CloudWatch log groups
- Creates RDS databases
- Registers task definitions
- Creates ECS services

### Step 6: Verify Deployment

```bash
# Get ALB DNS name
source ./deployment/alb-outputs.sh
echo "Access your application at: http://$ALB_DNS"

# Check service status
aws ecs describe-services \
  --cluster notes-app-cluster \
  --services notes-app-frontend-service notes-app-auth-service notes-app-notes-service \
  --region us-east-1

# View logs
aws logs tail /ecs/notes-app-frontend --follow
aws logs tail /ecs/notes-app-auth --follow
aws logs tail /ecs/notes-app-notes --follow
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │       ALB           │
                │   (Port 80/443)     │
                └──────┬───┬───┬──────┘
                       │   │   │
            ┌──────────┘   │   └──────────┐
            │              │              │
    ┌───────▼────────┐ ┌──▼──────────┐ ┌─▼────────────┐
    │ Frontend       │ │ Auth        │ │ Notes        │
    │ Service        │ │ Service     │ │ Service      │
    │ (Port 80)      │ │ (Port 8000) │ │ (Port 8000)  │
    └────────────────┘ └──┬──────────┘ └─┬────────────┘
                          │              │
                    ┌─────▼──────────────▼─────┐
                    │    RDS PostgreSQL        │
                    │  auth_db  │  notes_db    │
                    └──────────────────────────┘
```

## Configuration Files

### Environment Variables

Edit the appropriate environment file before deployment:

**Development** (`deployment/env.dev.sh`):
```bash
ENVIRONMENT="dev"
DB_INSTANCE_CLASS="db.t3.micro"
ECS_TASK_CPU="256"
ECS_TASK_MEMORY="512"
```

**Production** (`deployment/env.prod.sh`):
```bash
ENVIRONMENT="prod"
DB_INSTANCE_CLASS="db.t3.small"
ECS_TASK_CPU="512"
ECS_TASK_MEMORY="1024"
ENABLE_AUTO_SCALING=true
```

### Task Definitions

Located in `deployment/`:
- `ecs-task-frontend.json`: Frontend container configuration
- `ecs-task-auth.json`: Auth service configuration
- `ecs-task-notes.json`: Notes service configuration

## Customization

### Change RDS Password

⚠️ **SECURITY WARNING**: Default password is "ChangeMe123!" - Change this immediately!

1. Edit `deployment/env.prod.sh`:
   ```bash
   export POSTGRES_PASSWORD="YourStrongPassword123!"
   ```

2. Update RDS instance:
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier notes-app-auth-db \
     --master-user-password NewPassword123!
   ```

### Enable HTTPS

To enable HTTPS, you need an ACM certificate:

1. Create or import certificate in ACM
2. Update task definitions with HTTPS listener configuration
3. Add listener rule to ALB

### Custom Domain

1. Create Route 53 hosted zone or use existing domain
2. Create DNS record pointing to ALB DNS name
3. Update frontend environment variables with custom domain

### Auto Scaling

To enable auto scaling for production:

```bash
# Create target tracking scaling policy
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name notes-app-asg \
  --launch-template LaunchTemplateName=notes-app \
  --min-size 2 \
  --max-size 5 \
  --desired-capacity 2

aws autoscaling put-scaling-policy \
  --auto-scaling-group-name notes-app-asg \
  --policy-name target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://policy.json
```

## Monitoring and Logging

### CloudWatch Logs

View logs for each service:

```bash
# Frontend logs
aws logs tail /ecs/notes-app-frontend --follow

# Auth service logs
aws logs tail /ecs/notes-app-auth --follow

# Notes service logs
aws logs tail /ecs/notes-app-notes --follow
```

### CloudWatch Metrics

Monitor service health:

```bash
# View ALB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/notes-app-alb/xxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

## Troubleshooting

### Service Won't Start

```bash
# Check service status
aws ecs describe-services \
  --cluster notes-app-cluster \
  --services notes-app-auth-service

# Check task status
aws ecs describe-tasks \
  --cluster notes-app-cluster \
  --tasks <task-arn>

# View container logs
aws logs tail /ecs/notes-app-auth --follow
```

### Database Connection Issues

```bash
# Check RDS instance
aws rds describe-db-instances \
  --db-instance-identifier notes-app-auth-db

# Test connection from ECS task
aws ecs execute-command \
  --cluster notes-app-cluster \
  --task <task-id> \
  --container notes-app-auth \
  --interactive \
  --command "/bin/sh"
```

### ALB Health Check Failures

1. Check security group rules
2. Verify target group health check path
3. Check application logs for startup issues

## Cost Optimization

1. **Use Fargate Spot**: 70% cheaper but less reliable
   ```bash
   --capacity-provider-strategy capacityProvider=FARGATE_SPOT,weight=1
   ```

2. **Right-size instances**: Use t3 for dev, consider savings plans for prod

3. **Use RDS Reserved Instances**: Reduce database costs

4. **Set auto-scaling policies**: Scale down during low traffic

## Security Best Practices

1. **Change default passwords**: Update RDS and application secrets
2. **Use Secrets Manager**: Store sensitive data securely
3. **Enable encryption**: RDS encryption, S3 encryption
4. **VPC endpoints**: For private access to AWS services
5. **WAF**: Enable AWS WAF on ALB for production
6. **Security groups**: Restrict inbound/outbound traffic

## Cleanup

To remove all AWS resources and avoid charges:

```bash
# Delete ECS services
aws ecs delete-service \
  --cluster notes-app-cluster \
  --service notes-app-frontend-service \
  --force

# Delete ECS cluster
aws ecs delete-cluster --cluster notes-app-cluster

# Delete RDS instances
aws rds delete-db-instance \
  --db-instance-identifier notes-app-auth-db \
  --skip-final-snapshot

# Delete ALB
aws elbv2 delete-load-balancer --load-balancer-arn <alb-arn>

# Delete VPC
aws ec2 delete-vpc --vpc-id <vpc-id>

# Delete ECR repositories
aws ecr delete-repository --repository-name notes-app-frontend --force
```

## Support and Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/what-is-fargate.html)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)

## Next Steps

1. **CI/CD Integration**: Set up GitHub Actions or AWS CodePipeline for automated deployments
2. **Monitoring**: Set up CloudWatch dashboards and alarms
3. **Disaster Recovery**: Implement backup and disaster recovery strategies
4. **Performance Optimization**: Use CloudFront CDN for frontend assets
5. **Database Optimization**: Set up read replicas and caching strategies
