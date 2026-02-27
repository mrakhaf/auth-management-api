import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // Log request details
    this.logger.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url}`
    );

    // Capture the original end method
    const originalEnd = res.end;
    
    // Override res.end to log after response is sent
    res.end = (chunk?: any, encoding?: any) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const statusCode = res.statusCode;
      
      // Determine log level based on status code
      const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${statusCode} ${responseTime}ms`;
      
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Call the original end method
      return originalEnd.call(res, chunk, encoding);
    };

    next();
  }
}
