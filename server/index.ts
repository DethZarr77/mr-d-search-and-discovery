import express, { type Express } from 'express';
import { catalogRouter } from './containers/CatalogContainer';

const app: Express = express();
const port = 3000;

app.use(catalogRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
