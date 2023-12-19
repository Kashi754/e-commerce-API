/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.order_details RESTART IDENTITY CASCADE')
    await knex('order_details').insert([
        {
            shipping_address_id: 1,
            shipping_method: 'USPS Next Day',
        },
        {
            shipping_address_id: 2,
            shipping_method: 'UPS Ground',
            status: 'delivered',
            tracking_number: '1Z64F78A0450293517',
        },
        {
            shipping_address_id: 3,
            shipping_method: 'FedEx Same Day',
            status: 'canceled',
        },
    ]);
};