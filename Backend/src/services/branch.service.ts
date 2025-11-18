import { BranchRepository } from "../repositories/branch.repository";
import { IBranch } from "../models/Branch";
import { PaginationQuery, PaginationResult, GeoLocation } from "../types";
import { geocodeAddress } from "../config/googleMaps";

export class BranchService {
  private branchRepository: BranchRepository;

  constructor() {
    this.branchRepository = new BranchRepository();
  }

  async getAllBranches(
    query: PaginationQuery & { isActive?: boolean; search?: string }
  ): Promise<PaginationResult<IBranch>> {
    return this.branchRepository.findAll(query);
  }

  async getBranchById(id: string): Promise<IBranch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return branch;
  }

  async createBranch(data: {
    name: string;
    address: string;
    phone: string;
    isActive?: boolean;
    operatingHours?: Record<string, { open: string; close: string }>;
  }): Promise<IBranch> {
    const geocodeResult = await geocodeAddress(data.address);

    return this.branchRepository.create({
      ...data,
      location: geocodeResult.location,
      formattedAddress: geocodeResult.formattedAddress,
    });
  }

  async updateBranch(
    id: string,
    data: Partial<{
      name: string;
      address: string;
      phone: string;
      isActive: boolean;
      operatingHours: Record<string, { open: string; close: string }>;
    }>
  ): Promise<IBranch> {
    const existingBranch = await this.branchRepository.findById(id);
    if (!existingBranch) {
      throw new Error("Branch not found");
    }

    let location = existingBranch.location;
    let formattedAddress = existingBranch.formattedAddress;

    if (data.address && data.address !== existingBranch.address) {
      const geocodeResult = await geocodeAddress(data.address);
      location = geocodeResult.location;
      formattedAddress = geocodeResult.formattedAddress;
    }

    const updated = await this.branchRepository.updateById(id, {
      ...data,
      location,
      formattedAddress,
    });

    if (!updated) {
      throw new Error("Failed to update branch");
    }

    return updated;
  }

  async deleteBranch(id: string): Promise<void> {
    const deleted = await this.branchRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Branch not found");
    }
  }

  async getNearbyBranches(
    location: GeoLocation,
    radius: number = 10
  ): Promise<IBranch[]> {
    return this.branchRepository.findNearby(location, radius);
  }
}
