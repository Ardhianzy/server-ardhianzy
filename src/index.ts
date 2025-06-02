import express, { Request, Response, Application } from 'express';

const app: Application = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from Express with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});