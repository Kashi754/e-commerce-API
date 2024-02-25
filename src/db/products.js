const knexFile = require('../../knexFile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexFile[env];
const knex = require('knex')(configOptions);
require('dotenv').config();

module.exports = {
  getAllProducts: async (filters, done) => {
    let { priceLessThan, priceGreaterThan } = filters;
    priceLessThan = Number(priceLessThan) || 1000000000000;
    priceGreaterThan = Number(priceGreaterThan) || 0;

    try {
      const results = await knex('product')
        .join(
          'product_inventory',
          'product.inventory_id',
          '=',
          'product_inventory.id'
        )
        .where('product.price', '>=', priceGreaterThan)
        .where('product.price', '<=', priceLessThan)
        .select({
          id: 'product.id',
          name: 'product.name',
          price: 'product.price',
          description: 'product.description',
          qty_in_stock: 'product_inventory.quantity',
          image_file: 'product.image_file',
        });

      if (results.length < 1) {
        const error = new Error('No products found!');
        error.status = 404;
        return done(error);
      }

      done(null, results);
    } catch (err) {
      done(err);
    }
  },

  getAllCategories: async (done) => {
    try {
      const results = await knex.select().from('category');
      if (results.length < 1) {
        const error = new Error('No categories found!');
        error.status = 404;
        return done(error);
      }

      done(null, results);
    } catch (err) {
      done(err);
    }
  },

  addCategory: async (category, done) => {
    try {
      const categoryExists = await knex
        .select()
        .from('category')
        .where('name', category);
      if (categoryExists.length > 0) {
        const error = new Error(`Category ${category} already exists!`);
        error.status = 400;
        return done(error);
      }

      const response = await knex('category').insert({ name: category }, [
        'id',
        'name',
      ]);
      done(null, response);
    } catch (err) {
      done(err);
    }
  },

  findProductsByFilter: async (searchTerm, filters, categoryId, done) => {
    let { priceLessThan, priceGreaterThan } = filters;
    priceLessThan = Number(priceLessThan) || 1000000000000;
    priceGreaterThan = Number(priceGreaterThan) || 0;
    const searchFilter = '%' + searchTerm + '%';

    const baseQueryBuilder = knex('product')
      .join(
        'product_inventory',
        'product.inventory_id',
        '=',
        'product_inventory.id'
      )
      .join(
        'product_category',
        'product.id',
        '=',
        'product_category.product_id'
      )
      .join('category', 'product_category.category_id', '=', 'category.id');

    let searchQueryBuilder = (builder) => {
      builder
        .whereILike('product.name', searchFilter)
        .orWhereILike('product.description', searchFilter)
        .orWhereILike('category.name', searchFilter);
    };

    let productId = parseInt(searchTerm);
    if (productId) {
      searchQueryBuilder = (builder) =>
        builder.where('product.id', '=', productId);
    }

    const categoryQueryBuilder = (builder) => {
      searchTerm
        ? builder
            .where('category.id', '=', categoryId)
            .andWhere(searchQueryBuilder)
        : builder.where('category.id', '=', categoryId);
    };

    const finalQueryBuilder = baseQueryBuilder.where(
      categoryId ? categoryQueryBuilder : searchQueryBuilder
    );

    const completeQuery = finalQueryBuilder
      .andWhere('product.price', '>=', priceGreaterThan)
      .andWhere('product.price', '<=', priceLessThan)
      .distinct({
        id: 'product.id',
        name: 'product.name',
        price: 'product.price',
        description: 'product.description',
        qty_in_stock: 'product_inventory.quantity',
        image_file: 'product.image_file',
      });

    try {
      const results = await completeQuery;

      if (results.length < 1) {
        const error = new Error('No products found!');
        console.error(error);
        error.status = 404;
        return done(error);
      }

      done(null, results);
    } catch (err) {
      console.error(err);
      done(err);
    }
  },

  getCategoriesForProduct: async (productId, done) => {
    try {
      const results = await knex('product_category')
        .join('category', 'product_category.category_id', '=', 'category.id')
        .where('product_category.product_id', '=', productId)
        .select({
          id: 'category.id',
          name: 'category.name',
        });

      done(null, results);
    } catch (err) {
      console.error(err);
      done(err);
    }
  },

  findProductsById: async (id, done) => {
    try {
      const results = await knex('product')
        .join(
          'product_inventory',
          'product.inventory_id',
          '=',
          'product_inventory.id'
        )
        .where('product.id', '=', id)
        .first({
          id: 'product.id',
          name: 'product.name',
          price: 'product.price',
          description: 'product.description',
          qty_in_stock: 'product_inventory.quantity',
          image_file: 'product.image_file',
        });

      if (!results) {
        const error = new Error(`Product with ID ${id} not found!`);
        error.status = 404;
        return done(error);
      }

      done(null, results);
    } catch (err) {
      done(err);
    }
  },

  addProductToDatabase: async (product, quantity, categoryIds, done) => {
    try {
      const results = await knex('product')
        .returning(['id', 'inventory_id'])
        .insert(product);

      const { inventory_id, id: product_id } = results[0];

      await knex('product_inventory')
        .where('id', inventory_id)
        .update({ quantity }, ['quantity']);

      if (categoryIds.length > 0) {
        const categoryArray = [];

        for (const category_id of categoryIds) {
          categoryArray.push({ category_id, product_id });
        }

        await knex('product_category').insert(categoryArray);
      }

      done(null);
    } catch (err) {
      done(err);
    }
  },

  editProductById: async (productId, product, quantity, categoryIds, done) => {
    try {
      let results = await knex('product')
        .where({ id: productId })
        .update(product, ['id', 'inventory_id']);

      if (!results) {
        results = await knex('product')
          .where({ id: productId })
          .first('id', 'inventory_id');
      }

      const { inventory_id, id: product_id } = results[0];

      await knex('product_inventory')
        .where('id', inventory_id)
        .update({ quantity }, ['quantity']);

      await knex('product_category').where('product_id', '=', product_id).del();

      if (categoryIds.length > 0) {
        const categoryArray = [];

        for (const category_id of categoryIds) {
          categoryArray.push({ category_id, product_id });
        }

        await knex('product_category').insert(categoryArray);
      }

      done(null);
    } catch (err) {
      done(err);
    }
  },
};
