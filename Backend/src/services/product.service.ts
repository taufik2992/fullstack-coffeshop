import { ProductRepository } from '../repositories/product.repository';
import { IProduct } from '../models/Product';
import { PaginationQuery, PaginationResult } from '../types';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(query: PaginationQuery & { category?: string; isAvailable?: boolean; search?: string }): Promise<PaginationResult<IProduct>> {
    return this.productRepository.findAll(query);
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(
    data: {
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      isAvailable: boolean;
    },
    imageFile?: Express.Multer.File
  ): Promise<IProduct> {
    let imageUrl = '';

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile, 'coffeeshop/products');
    } else {
      throw new Error('Product image is required');
    }

    return this.productRepository.create({
      ...data,
      image: imageUrl,
    });
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      isAvailable: boolean;
    }>,
    imageFile?: Express.Multer.File
  ): Promise<IProduct> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    let imageUrl = existingProduct.image;

    if (imageFile) {
      if (existingProduct.image) {
        const publicId = extractPublicId(existingProduct.image);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (error) {
            // Log but don't fail if deletion fails
            console.error('Failed to delete old image:', error);
          }
        }
      }
      imageUrl = await uploadToCloudinary(imageFile, 'coffeeshop/products');
    }

    const updated = await this.productRepository.updateById(id, {
      ...data,
      image: imageUrl,
    });

    if (!updated) {
      throw new Error('Failed to update product');
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.image) {
      const publicId = extractPublicId(product.image);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }
    }

    const deleted = await this.productRepository.deleteById(id);
    if (!deleted) {
      throw new Error('Failed to delete product');
    }
  }
}

