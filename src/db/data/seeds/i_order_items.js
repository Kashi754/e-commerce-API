exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.order_items RESTART IDENTITY CASCADE')
    await knex('order_items').insert([
        {
            order_id: 1,
            product_id: 1,
            quantity: 2
        },
        {
            order_id: 2,
            product_id: 6,
            quantity: 2
        },
        {
            order_id: 2,
            product_id: 1,
            quantity: 1
        },
        {
            order_id: 3,
            product_id: 2,
            quantity: 2
        },
        {
            order_id: 3,
            product_id: 3,
            quantity: 100
        },
        {
            order_id: 3,
            product_id: 4,
            quantity: 10
        },
        {
            order_id: 3,
            product_id: 5,
            quantity: 50
        },
    ]);
};