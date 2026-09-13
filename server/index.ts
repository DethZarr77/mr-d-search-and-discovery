import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { catalogRouter } from './containers/CatalogContainer';

const app: Express = express();
const port = 3000;

const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

app.use((req: Request, res: Response, next: NextFunction) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.has(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
	}
	res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.sendStatus(204);
		return;
	}

	next();
});

app.use(catalogRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
