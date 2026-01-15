# Notes App - AWS ECS Fargate Deployment

Complete deployment solution for deploying the Notes App (React frontend + FastAPI backend services) to AWS ECS Fargate.

## 🚀 Quick Start

```bash
# 1. Navigate to deployment directory
cd deployment

# 2. Make scripts executable
chmod +x *.sh

# 3. Run the interactive wizard
./quickstart.sh
```

That's it! The wizard will handle everything.

## 📦 What's Included

### Infrastructure
- **AWS ECS Fargate**: Serverless container orchestration
- **AWS RDS PostgreSQL**: Managed relational databases
- **AWS ALB**: Application load balancing
- **AWS VPC**: Network isolation
- **AWS ECR**: Docker image registry
- **AWS CloudWatch**: Logging and monitoring

### Services
- **Frontend**: React with Vite (port 80)
- **Auth Service**: FastAPI authentication (port 8000)
- **Notes Service**: FastAPI notes management (port 8000)

### Automation
- **One-command deployment**: `./quickstart.sh`
- **IAM management**: Secure role configuration
- **Infrastructure setup**: VPC, networking, security
- **Service management**: Utils for scaling, logging, monitoring
- **Database management**: Backups, snapshots, connections

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Docker installed and running
- Bash shell
- Git (for version control)

**Verify:**
```bash
aws --version        # AWS CLI
docker --version     # Docker
bash --version       # Bash
```

## 📖 Documentation

1. **[deployment/README.md](deployment/README.md)** - Quick reference
2. **[deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)** - Comprehensive guide
3. **[deployment/IMPLEMENTATION_SUMMARY.md](deployment/IMPLEMENTATION_SUMMARY.md)** - What was created
4. **[project_context.md](project_context.md)** - Project overview

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Internet / Users                   │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────▼──────────┐
        │  Application Load    │
        │  Balancer (ALB)      │
        │  Port 80/443         │
        └──────┬──┬──┬─────────┘
               │  │  │
    ┌──────────┘  │  └──────────┐
    │             │             │
┌───▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│ Frontend │ │ Auth     │ │ Notes    │
│ React    │ │ FastAPI  │ │ FastAPI  │
│ ECS      │ │ ECS      │ │ ECS      │
└────┬─────┘ └──┬───────┘ └──┬───────┘
     │          │            │
     └──────────┼────────────┘
                │
        ┌───────▼────────┐
        │  RDS           │
        │  PostgreSQL    │
        │  2 Databases   │
        └────────────────┘
```

## 🎯 Deployment Steps

### Step 1: Validate Prerequisites
```bash
./quickstart.sh
# Wizard checks AWS CLI, Docker, credentials
```

### Step 2: Configure Settings
```bash
# Wizard prompts for:
# - Environment: dev or prod
# - AWS Region: e.g., us-east-1
```

### Step 3: Infrastructure Setup
```bash
# Wizard automatically runs:
./setup-iam.sh        # Create IAM roles
./setup-vpc.sh        # Create VPC & networking
./setup-alb.sh        # Create load balancer
```

### Step 4: Deployment
```bash
# Wizard automatically runs:
./deploy-to-aws.sh    # Build images, create resources
./deploy-services.sh  # Deploy ECS services
```

### Step 5: Access Application
```bash
# After deployment, access at:
# http://<ALB-DNS-NAME>

# Wizard shows the URL and provides:
# - Frontend: React app
# - Auth: /api/auth/* endpoints
# - Notes: /api/notes/* endpoints
```

## 📊 Configuration Options

### Environment Variables

**Development** (`env.dev.sh`):
- Small instance sizes (db.t3.micro)
- Low resource allocation (256 CPU, 512 MB RAM)
- 1 task per service
- 7-day backups

**Production** (`env.prod.sh`):
- Larger instance sizes (db.t3.small)
- Higher resource allocation (512 CPU, 1024 MB RAM)
- 2 tasks per service
- 30-day backups
- Auto-scaling enabled
- Multi-AZ support

### Customize

Edit `deployment/env.dev.sh` or `deployment/env.prod.sh` before deployment:

```bash
# Example: Change database class
export DB_INSTANCE_CLASS="db.t3.small"

# Example: Change task resources
export ECS_TASK_CPU="512"
export ECS_TASK_MEMORY="1024"
```

## 🔧 Common Operations

### Scale Services
```bash
source deployment/utils.sh
scale_service notes-app-auth-service 3
```

### View Logs
```bash
source deployment/utils.sh
view_service_logs notes-app-frontend-service
```

### Check Health
```bash
source deployment/utils.sh
verify_deployment
```

### Database Backup
```bash
source deployment/utils.sh
create_db_snapshot notes-app-auth-db
```

### Connect to Database
```bash
source deployment/utils.sh
connect_to_rds notes-app-auth-db auth_db
```

## 📚 Available Utilities

After deployment, use utilities for management:

```bash
source deployment/utils.sh

# Service management
get_service_status <SERVICE>
scale_service <SERVICE> <COUNT>
restart_service <SERVICE>
view_service_logs <SERVICE>

# Database management
get_rds_status <DB_INSTANCE>
create_db_snapshot <DB_INSTANCE>
connect_to_rds <DB_INSTANCE> <DB_NAME>

# Monitoring
check_alb_health
get_ecs_metrics <SERVICE>
verify_deployment

# Cleanup
cleanup_all  # Delete all resources (WARNING!)
```

## 💰 Cost Estimation

### Development
- ECS Fargate: $15-20/month
- RDS db.t3.micro: $30-40/month
- ALB: $20/month
- Data transfer: $5-10/month
- **Total: ~$70-90/month**

### Production
- ECS Fargate (2x): $30-40/month
- RDS db.t3.small (Multi-AZ): $100-120/month
- ALB: $20/month
- Data transfer: $20-50/month
- **Total: ~$170-230/month**

## 🔐 Security

### Built-in Features
✅ IAM roles with least privilege principle
✅ Security groups for network isolation
✅ VPC for private subnets
✅ RDS encryption support
✅ CloudWatch audit logging
✅ Automated health checks

### Recommended Actions
1. **Change RDS passwords** (default: ChangeMe123!)
2. **Use AWS Secrets Manager** for sensitive data
3. **Enable HTTPS** with ACM certificates
4. **Configure WAF** on ALB
5. **Enable VPC Flow Logs** for monitoring
6. **Set up CloudWatch alarms**

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
source deployment/utils.sh
view_service_logs notes-app-auth-service

# Check service status
aws ecs describe-services \
  --cluster notes-app-cluster \
  --services notes-app-auth-service
```

### Database connection issues
```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier notes-app-auth-db

# Try connecting
source deployment/utils.sh
connect_to_rds notes-app-auth-db
```

### ALB not routing traffic
```bash
# Check target health
source deployment/utils.sh
check_alb_health

# Check security groups
aws ec2 describe-security-groups
```

## 🧹 Cleanup

To remove all resources and stop incurring costs:

```bash
source deployment/utils.sh
cleanup_all

# Or manually:
./deployment/deploy-services.sh  # Remove services
aws ecs delete-cluster notes-app-cluster  # Remove cluster
aws rds delete-db-instance notes-app-auth-db --skip-final-snapshot
aws ec2 delete-vpc --vpc-id <VPC_ID>
```

## 📖 Advanced Topics

### CI/CD Integration
- Set up GitHub Actions for automated deployments
- Use AWS CodePipeline for continuous delivery
- Integrate with CodeBuild for testing

### Performance Optimization
- Enable CloudFront CDN for frontend assets
- Use RDS read replicas for read-heavy workloads
- Implement caching strategies
- Configure auto-scaling policies

### Disaster Recovery
- Configure database backups
- Set up cross-region replication
- Test recovery procedures
- Document RTO/RPO requirements

### Monitoring & Alerting
- Create CloudWatch dashboards
- Set up SNS notifications
- Configure X-Ray tracing
- Implement custom metrics

## 📞 Support

### Documentation
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/what-is-fargate.html)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/)

### Troubleshooting Guides
- [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) - Detailed troubleshooting
- [deployment/README.md](deployment/README.md) - Quick reference

## 🎓 Learning Resources

This deployment demonstrates:
- Infrastructure as Code (IaC) automation
- Containerization with Docker
- Container orchestration with ECS
- Microservices architecture
- Network design with VPC
- Database management with RDS
- Load balancing with ALB
- AWS security best practices
- Monitoring and logging
- Cost optimization

## 📝 Project Files

```
notes-app/
├── backend/
│   ├── auth-service/        # Authentication microservice
│   └── notes-service/       # Notes management microservice
├── frontend/                # React frontend application
├── deployment/              # Deployment scripts and configs
├── docker-compose.yml       # Local development setup
├── project_context.md       # Project documentation
└── README.md               # This file
```

## 🚀 Getting Started

1. **First time?** Read [IMPLEMENTATION_SUMMARY.md](deployment/IMPLEMENTATION_SUMMARY.md)
2. **Ready to deploy?** Run `cd deployment && ./quickstart.sh`
3. **Need details?** Check [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md)
4. **Want to manage?** Use `source deployment/utils.sh`

## ✨ Features

✅ **One-Command Deployment**: Interactive wizard handles everything
✅ **Production-Ready**: Follows AWS best practices
✅ **Highly Scalable**: Easy service scaling and auto-scaling
✅ **Fully Monitored**: CloudWatch logging and metrics
✅ **Secure**: IAM roles, security groups, VPC isolation
✅ **Automated**: Infrastructure as Code
✅ **Multi-Environment**: Dev and prod configurations
✅ **Well-Documented**: Comprehensive guides included
✅ **Easy Management**: Utility scripts for common tasks
✅ **Cost-Optimized**: Right-sized instances and resources

## 📄 License

This deployment configuration is part of the Notes App project.

---

**Ready to deploy?** 🚀

```bash
cd deployment
chmod +x *.sh
./quickstart.sh
```

Your application will be live in minutes!
