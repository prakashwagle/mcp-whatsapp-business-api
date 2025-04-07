import { config } from './config';
import { logger } from './utils/logger';
import app from './app';

const port = config.port;

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
}); 