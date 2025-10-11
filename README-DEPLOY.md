# Deployment Guide (AWS)

Region: ap-southeast-2

## Overview
- Backend: AWS SAM deploys an Express app to Lambda + API Gateway
- Frontend: AWS Amplify Hosting (amplify.yml already configured)

## One-time AWS setup
1) Create or confirm the GitHub OIDC provider exists (Account -> IAM -> Identity providers). If not, add provider for token.actions.githubusercontent.com.
2) Create a deployment role for GitHub Actions:
   - Deploy iam/github-oidc-role.yaml (CloudFormation):
     - Console: CloudFormation -> Create stack -> With new resources -> Upload this template
     - Parameters:
       - GitHubOrg: your GitHub org/user (e.g., your-username)
       - GitHubRepo: my-fitness-app (or your repo name)
       - Branch: main (or the branch you want to deploy from)
   - After creation, copy the RoleArn output.
3) Add a GitHub repo secret:
   - Name: AWS_DEPLOY_ROLE_ARN
   - Value: the RoleArn from step 2

## Secrets for the app
Create runtime secrets (do NOT paste here):
- DATABASE_URL in SSM Parameter Store
- JWT_SECRET in SSM Parameter Store
- OPENAI_API_KEY in Secrets Manager

Commands:
```
# Mac terminal; replace values appropriately
AWS_REGION=ap-southeast-2
aws ssm put-parameter --region $AWS_REGION --name "/my-fitness-app/DATABASE_URL" --type SecureString --value "$DATABASE_URL" --overwrite
aws ssm put-parameter --region $AWS_REGION --name "/my-fitness-app/JWT_SECRET" --type SecureString --value "$JWT_SECRET" --overwrite
aws secretsmanager create-secret --region $AWS_REGION --name "my-fitness-app/OPENAI_API_KEY" --secret-string "$OPENAI_API_KEY" || \
aws secretsmanager update-secret --region $AWS_REGION --secret-id "my-fitness-app/OPENAI_API_KEY" --secret-string "$OPENAI_API_KEY"
```

## Manual deploy (optional)
```
# At repo root
npm ci
npm --prefix server ci
npm --prefix server run prisma:generate
sam build
sam deploy --stack-name my-fitness-app-api --resolve-s3 --capabilities CAPABILITY_IAM --region ap-southeast-2
```

## CI/CD deploy
- The workflow .github/workflows/deploy-backend.yml runs on push to main
- It assumes the role from AWS_DEPLOY_ROLE_ARN and deploys the SAM stack in ap-southeast-2
- After deployment, check the job logs for the API URL

## Frontend (Amplify)
- In the Amplify console, connect your GitHub repository and branch
- Ensure environment variable VITE_API_URL is set to your API Gateway base URL (output ApiUrl)
- The included amplify.yml builds the frontend and publishes dist/

## CORS
- The Express app allows .amplifyapp.com by default. After you have a final domain, set WEB_URL or FRONTEND_URL in the Lambda environment and redeploy to tighten CORS.