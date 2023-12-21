const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

import 'dotenv/config';

const knex = require('knex')(configOptions);

module.exports = {
    getAllProducts: async (filters, done) => {
        let { priceLessThan, priceGreaterThan } = filters;
        priceLessThan = Number(priceLessThan) || 1000000000000;
        priceGreaterThan = Number(priceGreaterThan) || 0;

        try {
            const results = await knex('product')
                .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
                .where('product.price', '>=', priceGreaterThan)
                .where('product.price', '<=', priceLessThan)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                });

                if(results.length < 1) {
                    const error = new Error('No products found!');
                    error.status = 404;
                    return done(error);
                }
    
                done(null, results);
        } catch (err) {
            done(err);
        }
    },

    findProductsByFilter: async (searchTerm, filters, categoryId, done) => {
        let { priceLessThan, priceGreaterThan } = filters;
        priceLessThan = Number(priceLessThan) || 1000000000000;
        priceGreaterThan = Number(priceGreaterThan) || 0;
        const searchFilter = '%' + searchTerm + '%';

        let queryBuilder = knex('product')
        .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
        .join('product_category', 'product.id', '=', 'product_category.product_id')
        .join('category', 'product_category.category_id', '=', 'category.id')
        

        queryBuilder = !categoryId ? queryBuilder : queryBuilder
            .where('category.id', '=', categoryId);

        queryBuilder = !searchTerm ? queryBuilder : queryBuilder
            .whereILike('product.name', searchFilter)
            .orWhereILike('product.description', searchFilter)
            .orWhereILike('category.name', searchFilter)

        try {
            const results = await queryBuilder
                .andWhere('product.price', '>=', priceGreaterThan)
                .andWhere('product.price', '<=', priceLessThan)
                .select({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                })
                .distinct('product.id');

            if(results.length < 1) {
                const error = new Error('No products found!');
                error.status = 404;
                return done(error);
            }

            done(null, results);
        } catch(err) {
            done(err);
        }
    },

    findProductsById: async (id, done) => {
        try {
            const results = await knex('product')
                .join('product_inventory', 'product.inventory_id', '=', 'product_inventory.id')
                .where('product.id', '=', id)
                .first({
                    id: 'product.id',
                    name: 'product.name',
                    price: 'product.price',
                    description: 'product.description',
                    qty_in_stock: 'product_inventory.quantity'
                })

                if(!results) {
                    const error = new Error(`Product with ID ${id} not found!`);
                    error.status = 404;
                    return done(error);
                }
    
                done(null, results);
        } catch (err) {
            done(err);
        }
    }
}