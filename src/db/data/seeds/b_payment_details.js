/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.payment_details RESTART IDENTITY CASCADE')
    await knex('payment_details').insert([
        {
            user_id: 1,
            provider: 'paypal',
        },
        {
            user_id: 2,
            provider: 'paypal',
            status: 'complete'
        },
        {
            user_id: 3,
            provider: 'paypal',
            status: 'declined'
        },
    ]);
};