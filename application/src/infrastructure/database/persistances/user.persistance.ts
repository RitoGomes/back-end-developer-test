
import mongoose, { Schema, model } from 'mongoose';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository';

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

const UserModel = model<User>('User', UserSchema);

export class UserPersistence implements IUserRepository {
  async create(user: User): Promise<User> {
    const created = await UserModel.create(user);
    return created.toObject();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user?.toObject() ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user?.toObject() ?? null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((u) => u.toObject());
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    return user?.toObject() ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
