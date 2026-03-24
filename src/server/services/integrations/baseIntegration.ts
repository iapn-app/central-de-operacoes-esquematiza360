import { Request, Response } from 'express';

export interface IntegrationService {
  processData(data: any): Promise<any>;
}

export const handleIntegration = (service: IntegrationService) => async (req: Request, res: Response) => {
  try {
    const result = await service.processData(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({ error: 'Failed to process integration data' });
  }
};
