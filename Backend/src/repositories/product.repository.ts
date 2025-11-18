import Product, { IProduct } from '../models/Product';
import { PaginationResult, PaginationQuery } from '../types';

export class ProductRepository {
  async findAll(query: PaginationQuery & { category?: string; isAvailable?: boolean; search?: string }): Promise<PaginationResult<IProduct>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    if (query.sort) {
      sort[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const [data, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).sort(sort).lean(),
      Product.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IProduct[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).lean() as unknown as IProduct | null;
  }

  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return product.save();
  }

  async updateById(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean() as unknown as IProduct | null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  async findByIds(ids: string[]): Promise<IProduct[]> {
    return Product.find({ _id: { $in: ids } }).lean() as unknown as IProduct[];
  }
}

