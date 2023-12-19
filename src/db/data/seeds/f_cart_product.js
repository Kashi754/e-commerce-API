/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.cart_product RESTART IDENTITY CASCADE')
    await knex('cart_product').insert([
        {
            cart_id: 1,
            product_id: 1,
            quantity: 5
        },
        {
            cart_id: 1,
            product_id: 2,
            quantity: 1
        },
        {
            cart_id: 2,
            product_id: 2,
            quantity: 1
        },
        {
            cart_id: 2,
            product_id: 6,
            quantity: 1
        },
        {
            cart_id: 2,
            product_id: 1,
            quantity: 1
        },
        {
            cart_id: 3,
            product_id: 3,
            quantity: 10
        },
        {
            cart_id: 3,
            product_id: 4,
            quantity: 2
        },

    ]);
};