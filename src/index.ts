import express, { Request, Response } from 'express';
import { matchRouter } from "./routes/matches";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from express server');
});

app.use('/matches', matchRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});