// Clean architecture — domain layer with no infrastructure imports
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class RegisterUser {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(email: string, name: string): Promise<User> {
    const user: User = { id: crypto.randomUUID(), email, name };
    await this.userRepo.save(user);
    return user;
  }
}
