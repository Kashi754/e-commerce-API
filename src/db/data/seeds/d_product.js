/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex.schema.raw('TRUNCATE shopping.product_inventory RESTART IDENTITY CASCADE');
    await knex.schema.raw('TRUNCATE shopping.product RESTART IDENTITY CASCADE')
    await knex('product').insert([
        {
            name: 'Bacon Wrapped Steak',
            price: '$30',
            description: 'A 12oz black angus ribey steak wrapped in 1lb of hickory smoked bacon',
            category: 'Food',
        },
        {
            name: 'Smith & Wesson Model 19',
            price: '$1000',
            description: '357 Magnum, 6 Shot, Double Action Revolver With Walnut Grips, and Blued Finish.',
            category: 'Firearms',
        },
        {
            name: 'Sex Panther Cologne Spray',
            price: '$40',
            description: "It's called Sex Panther by Odeon. It's made with bits of real panther, so you know it's good. They've done studies, you know. Sixty percent of the time, it works every time.",
            category: 'Fragrances',
        },
        {
            name: 'Test Item 4',
            price: '$100',
            category: 'Test',
        },
        {
            name: 'Test Item 5',
            price: '$5.50',
            category: 'Test',
        },
        {
            name: 'Test Item 6',
            price: '$89.99',
            category: 'Test',
        },
    ]);
};