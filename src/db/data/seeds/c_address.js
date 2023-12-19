/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.address RESTART IDENTITY CASCADE')
    await knex('address').insert([
        {
            user_id: 1,
            addr_line_1: '1234 Man Street',
            city: 'Pawnee',
            state: 'IN',
            zip_code: 46221
        },
        {
            user_id: 2,
            addr_line_1: '5555 Ranger Drive',
            city: 'Dallas',
            state: 'TX',
            zip_code: 75254
        },
        {
            user_id: 3,
            addr_line_1: '9876 Sex Panther Avenue',
            addr_line_2: 'Apt 12',
            city: 'Los Angeles',
            state: 'CA',
            zip_code: 90001
        },
    ]);
};