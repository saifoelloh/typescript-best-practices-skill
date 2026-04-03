// Architecture violation — domain importing from infrastructure
import { Request } from '../../infrastructure/express';
import { Model } from '../../infrastructure/sequelize';

export class User extends Model {
  id: string;
  email: string;

  handleRequest(req: Request): void {
    this.email = req.body.email;
  }
}
