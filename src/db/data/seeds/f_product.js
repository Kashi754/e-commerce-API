/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex.schema.raw(
    'TRUNCATE shopping.product_inventory RESTART IDENTITY CASCADE'
  );
  await knex.schema.raw('TRUNCATE shopping.product RESTART IDENTITY CASCADE');
  await knex('product').insert(
    [
      {
        name: '12oz Ribeye Steak',
        price: 30,
        description:
          'A 12oz black angus ribeye steak wrapped in 1lb of hickory smoked bacon',
        image_file: 'ribeye.jpg',
      },
      {
        name: 'Sex Panther Cologne Spray',
        price: 40,
        description:
          "It's called Sex Panther by Odeon. It's made with bits of real panther, so you know it's good. They've done studies, you know. Sixty percent of the time, it works every time.",
        image_file: 'sex-panther.jpg',
      },
      {
        name: 'Test Item 3',
        price: 100,
        image_file: '3.jpg',
      },
      {
        name: 'Test Item 4',
        price: 5.5,
        image_file: '4.jpg',
      },
      {
        name: 'Test Item 5',
        price: 89.99,
        image_file: '5.jpg',
      },
    ],
    ['id']
  );
};
