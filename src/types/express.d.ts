declare global {
  namespace Express {
    interface Request {
      user?: {
        admin_Id: number;
        username: string;
      };
      admin?: {
        admin_Id: number;
        username: string;
      };
    }
  }
}

export {};
