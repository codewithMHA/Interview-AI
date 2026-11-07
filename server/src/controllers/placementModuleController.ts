import { Request, Response, NextFunction } from 'express';
import { PLACEMENT_MODULES } from '../data/placementModulesData.js';

export const getAllModules = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = PLACEMENT_MODULES.map((m) => ({
      id: m.id,
      title: m.title,
      subtitle: m.subtitle,
      badge: m.badge,
      iconName: m.iconName,
      gradient: m.gradient,
      description: m.description,
      importanceRating: m.importanceRating,
      itemsCount: m.items.length,
    }));

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getModuleById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const foundModule = PLACEMENT_MODULES.find((m) => m.id === id);

    if (!foundModule) {
      res.status(404).json({
        success: false,
        error: `Placement module with ID '${id}' not found.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: foundModule,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

