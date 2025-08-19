import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateUserFromClerkDto {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface UpdateUserFromClerkDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromClerk(data: CreateUserFromClerkDto) {
    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
      },
    });
  }

  async updateFromClerk(clerkId: string, data: UpdateUserFromClerkDto) {
    return this.prisma.user.update({
      where: { clerkId },
      data,
    });
  }

  async deleteByClerkId(clerkId: string) {
    return this.prisma.user.delete({
      where: { clerkId },
    });
  }

  async findByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async upsertFromClerk(data: CreateUserFromClerkDto) {
    return this.prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
      },
      create: data,
    });
  }
}
