import { promises } from "fs";
import type { CatalogItem } from "../types";
import { CatalogRepository } from "./CatalogRepository";


export class FileCatalogRepository extends CatalogRepository{
    constructor(private filePath: string){
        super();
    }

    async findAll() {
        // TODO - check if we need a try...catch here
        const items = await promises.readFile(this.filePath, 'utf-8');
        return JSON.parse(items) as CatalogItem[];
    }
}