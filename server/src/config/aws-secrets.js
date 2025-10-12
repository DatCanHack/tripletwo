// server/src/config/aws-secrets.js
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const region = process.env.AWS_REGION || 'ap-southeast-1';

let ssmClient, secretsClient;
if (isLambda) {
  ssmClient = new SSMClient({ region });
  secretsClient = new SecretsManagerClient({ region });
}

const secretsCache = new Map();

async function getSSMParameter(paramName) {
  if (!isLambda) {
    return process.env[paramName.replace('/my-fitness-app/', '').toUpperCase()];
  }

  if (secretsCache.has(paramName)) {
    return secretsCache.get(paramName);
  }

  try {
    const command = new GetParameterCommand({
      Name: paramName,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    const value = response.Parameter.Value;
    secretsCache.set(paramName, value);
    return value;
  } catch (error) {
    console.error(`Failed to get SSM parameter ${paramName}:`, error);
    throw error;
  }
}

async function getSecretsManagerSecret(secretName) {
  if (!isLambda) {
    return process.env.OPENAI_API_KEY;
  }

  if (secretsCache.has(secretName)) {
    return secretsCache.get(secretName);
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    const response = await secretsClient.send(command);
    const value = response.SecretString;
    secretsCache.set(secretName, value);
    return value;
  } catch (error) {
    console.error(`Failed to get secret ${secretName}:`, error);
    throw error;
  }
}

export async function loadAWSSecrets() {
  if (!isLambda) {
    // In local environment, secrets are already in process.env
    return;
  }

  try {
    // Load SSM parameters if names are provided
    const dbParam = process.env.SSM_DATABASE_URL_PARAM;
    const jwtParam = process.env.SSM_JWT_SECRET_PARAM;
    const jwtRefreshParam = process.env.SSM_JWT_REFRESH_SECRET_PARAM;
    const googleClientIdParam = process.env.SSM_GOOGLE_CLIENT_ID_PARAM;
    const openaiSecretName = process.env.SECRETS_OPENAI_API_KEY_NAME;

    if (dbParam) {
      const databaseUrl = await getSSMParameter(dbParam);
      if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
    }

    if (jwtParam) {
      const jwtSecret = await getSSMParameter(jwtParam);
      if (jwtSecret) {
        process.env.JWT_SECRET = process.env.JWT_SECRET || jwtSecret;
        // Ensure refresh secret is available; fallback to the same value if a separate one isn't provided
        process.env.REFRESH_SECRET = process.env.REFRESH_SECRET || jwtSecret;
      }
    }

    if (jwtRefreshParam) {
      const refreshSecret = await getSSMParameter(jwtRefreshParam);
      if (refreshSecret) process.env.REFRESH_SECRET = refreshSecret;
    }

    if (googleClientIdParam) {
      const googleClientId = await getSSMParameter(googleClientIdParam);
      if (googleClientId) process.env.GOOGLE_CLIENT_ID = googleClientId;
    }

    if (openaiSecretName) {
      const openaiApiKey = await getSecretsManagerSecret(openaiSecretName);
      if (openaiApiKey) process.env.OPENAI_API_KEY = openaiApiKey;
    }

    // Final safety: if only JWT is available, reuse it for refresh
    if (process.env.JWT_SECRET && !process.env.REFRESH_SECRET) {
      process.env.REFRESH_SECRET = process.env.JWT_SECRET;
    }

  } catch (error) {
    console.error('Failed to load AWS secrets:', error);
    throw error;
  }
}
