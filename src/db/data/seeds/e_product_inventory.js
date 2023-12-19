/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('product_inventory')
        .where({id: 1})
        .update({ quantity: 100 });

    await knex('product_inventory')
        .where({id: 2})
        .update({ quantity: 2 });

    await knex('product_inventory')
        .where({id: 3})
        .update({ quantity: 1000 });

    await knex('product_inventory')
        .where({id: 4})
        .update({ quantity: 10 });

    await knex('product_inventory')
        .where({id: 5})
        .update({ quantity: 50 });

    await knex('product_inventory')
        .where({id: 6})
        .update({ quantity: 30 });    
};