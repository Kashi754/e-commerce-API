/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.order RESTART IDENTITY CASCADE')
    await knex('order').insert([
        {
            user_id: 1,
            payment_id: 1,
            details_id: 1
        },
        {
            user_id: 2,
            payment_id: 2,
            details_id: 2
        },
        {
            user_id: 3,
            payment_id: 3,
            details_id: 3
        },
    ]);
};