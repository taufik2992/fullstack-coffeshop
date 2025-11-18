import mongoose, { Schema, Document } from 'mongoose';
import { GeoLocation } from '../types';

export interface IBranch extends Document {
  name: string;
  address: string;
  phone: string;
  location: GeoLocation;
  formattedAddress: string;
  isActive: boolean;
  operatingHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [200, 'Branch name cannot exceed 200 characters'],
    },
    address: {
      type: String,
      required: [true, 'Branch address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Branch phone is required'],
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude'],
      },
    },
    formattedAddress: {
      type: String,
      required: [true, 'Formatted address is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
      },
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

BranchSchema.index({ location: '2dsphere' });
BranchSchema.index({ isActive: 1 });
BranchSchema.index({ name: 'text' });

export default mongoose.model<IBranch>('Branch', BranchSchema);

