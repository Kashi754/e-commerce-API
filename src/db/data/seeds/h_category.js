/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex.schema.raw('TRUNCATE shopping.category RESTART IDENTITY CASCADE');
  await knex('category').insert([
    { name: 'food' },
    { name: 'fragrances' },
    { name: 'electronics' },
    { name: 'toiletries' },
    { name: 'test1' },
    { name: 'test2' },
    { name: 'test3' },
    { name: 'test4' },
    { name: 'test5' },
  ]);
};
