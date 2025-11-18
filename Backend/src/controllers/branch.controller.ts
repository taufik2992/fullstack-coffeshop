import { Request, Response, NextFunction } from 'express';
import { BranchService } from '../services/branch.service';
import { AppError } from '../middlewares/errorHandler';

export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }

  getAllBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, isActive } = req.query;
      const result = await this.branchService.getAllBranches({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getBranchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const branch = await this.branchService.getBranchById(id);

      res.json({
        success: true,
        data: branch,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 404);
      }
      next(error);
    }
  };

  createBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, address, phone, isActive, operatingHours } = req.body;
      const branch = await this.branchService.createBranch({
        name,
        address,
        phone,
        isActive: isActive === 'true' || isActive === true,
        operatingHours: operatingHours ? JSON.parse(operatingHours) : undefined,
      });

      res.status(201).json({
        success: true,
        data: branch,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };

  updateBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, address, phone, isActive, operatingHours } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (address) updateData.address = address;
      if (phone) updateData.phone = phone;
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
      if (operatingHours) updateData.operatingHours = JSON.parse(operatingHours);

      const branch = await this.branchService.updateBranch(id, updateData);

      res.json({
        success: true,
        data: branch,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'Branch not found' ? 404 : 400);
      }
      next(error);
    }
  };

  deleteBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.branchService.deleteBranch(id);

      res.json({
        success: true,
        message: 'Branch deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'Branch not found' ? 404 : 400);
      }
      next(error);
    }
  };

  getNearbyBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lat, lng, radius } = req.query;
      const branches = await this.branchService.getNearbyBranches(
        {
          lat: Number(lat),
          lng: Number(lng),
        },
        Number(radius) || 10
      );

      res.json({
        success: true,
        data: branches,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };
}

