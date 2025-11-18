import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AppError } from '../middlewares/errorHandler';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, category, isAvailable, sort, order } = req.query;
      const result = await this.productService.getAllProducts({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
        category: category as string,
        isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
        sort: (sort as string) || 'createdAt',
        order: (order as 'asc' | 'desc') || 'desc',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 404);
      }
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, price, category, stock, isAvailable } = req.body;
      const imageFile = req.file;

      const product = await this.productService.createProduct(
        {
          name,
          description,
          price: Number(price),
          category,
          stock: Number(stock) || 0,
          isAvailable: isAvailable === 'true' || isAvailable === true,
        },
        imageFile
      );

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, price, category, stock, isAvailable } = req.body;
      const imageFile = req.file;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price) updateData.price = Number(price);
      if (category) updateData.category = category;
      if (stock !== undefined) updateData.stock = Number(stock);
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;

      const product = await this.productService.updateProduct(id, updateData, imageFile);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'Product not found' ? 404 : 400);
      }
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'Product not found' ? 404 : 400);
      }
      next(error);
    }
  };
}

