/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex.schema.raw('TRUNCATE shopping.user RESTART IDENTITY CASCADE');
  await knex('user').insert([
    {
      username: 'testUser1',
      email: 'ron_swanson@test.com',
      password_hash:
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678',
      first_name: 'Ron',
      last_name: 'Swanson',
    },
    {
      username: 'testUser2',
      email: 'chuck_norris@test.com',
      password_hash:
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678',
      first_name: 'Chuck',
      last_name: 'Norris',
    },
    {
      username: 'testUser3',
      email: 'ron_burgundy@test.com',
      password_hash:
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678',
      first_name: 'Ron',
      last_name: 'Burgundy',
    },
    {
      username: 'admin',
      email: 'admin@email.com',
      password_hash:
        '$2b$10$JDjrJpbntlkKAdv4Mo4Zu.VwGAxO42VsM4cYy9d/31b0ftothXjFC',
      first_name: 'Admin',
      last_name: 'Account',
      role: 'admin',
    },
  ]);
};
