import Branch, { IBranch } from '../models/Branch';
import { PaginationResult, PaginationQuery, GeoLocation } from '../types';
import { calculateDistance } from '../config/googleMaps';

export class BranchRepository {
  async findAll(query: PaginationQuery & { isActive?: boolean; search?: string }): Promise<PaginationResult<IBranch>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { address: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Branch.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Branch.countDocuments(filter),
    ]);

    return {
      data: data as unknown as IBranch[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<IBranch | null> {
    return Branch.findById(id).lean() as unknown as IBranch | null;
  }

  async create(branchData: Partial<IBranch>): Promise<IBranch> {
    const branch = new Branch(branchData);
    return branch.save();
  }

  async updateById(id: string, updateData: Partial<IBranch>): Promise<IBranch | null> {
    return Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean() as unknown as IBranch | null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Branch.findByIdAndDelete(id);
    return !!result;
  }

  async findNearby(location: GeoLocation, radius: number = 10): Promise<IBranch[]> {
    const branches = await Branch.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      },
    }).lean();

    // Calculate exact distance for each branch
    return branches.map((branch) => {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        branch.location.lat,
        branch.location.lng
      );
      return {
        ...(branch as unknown as IBranch),
        distance,
      } as unknown as IBranch & { distance: number };
    });
  }
}

