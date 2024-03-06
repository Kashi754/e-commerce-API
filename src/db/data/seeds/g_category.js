/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex.schema.raw('TRUNCATE shopping.category RESTART IDENTITY CASCADE');
  await knex('category').insert([
    {
      id: 1,
      name: 'food',
    },
    {
      id: 2,
      name: 'fragrances',
    },
    {
      id: 3,
      name: 'electronics',
    },
    {
      id: 4,
      name: 'toiletries',
    },
    {
      id: 5,
      name: 'test1',
    },
    {
      id: 6,
      name: 'test2',
    },
    {
      id: 7,
      name: 'test3',
    },
    {
      id: 8,
      name: 'test4',
    },
    {
      id: 9,
      name: 'test5',
    },
  ]);
};
