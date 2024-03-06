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
        id: 'e98ad94a-93d9-47a8-9111-8362ec70ebb3',
        name: '12oz Ribeye Steak',
        price: 30,
        description:
          'A 12oz black angus ribeye steak wrapped in 1lb of hickory smoked bacon',
        image_file: 'ribeye.jpg',
      },
      {
        id: 'cce8f5f3-babc-4b1c-8948-3ff58ca48b08',
        name: 'Sex Panther Cologne Spray',
        price: 40,
        description:
          "It's called Sex Panther by Odeon. It's made with bits of real panther, so you know it's good. They've done studies, you know. Sixty percent of the time, it works every time.",
        image_file: 'sex-panther.jpg',
      },
      {
        id: '7be28d68-8217-46f7-a636-abba17268af3',
        name: 'Test Item 3',
        price: 100,
        image_file: '3.jpg',
      },
      {
        id: '4be46d88-d34b-4e59-8907-40bab9c54802',
        name: 'Test Item 4',
        price: 5.5,
        image_file: '4.jpg',
      },
      {
        id: '2464fe26-78fb-4354-bd96-9e620257e9ae',
        name: 'Test Item 5',
        price: 89.99,
        image_file: '5.jpg',
      },
    ],
    ['id']
  );
  await knex('product_inventory').update('quantity', 100);
  const categories = [
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
  ];
  for (const categoryId of categories.map((c) => c.id)) {
    switch (categoryId) {
      case 1: {
        await knex('product_category').insert(
          [
            {
              product_id: 'e98ad94a-93d9-47a8-9111-8362ec70ebb3',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 2: {
        await knex('product_category').insert(
          [
            {
              product_id: 'cce8f5f3-babc-4b1c-8948-3ff58ca48b08',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 3: {
        await knex('product_category').insert(
          [
            {
              product_id: '4be46d88-d34b-4e59-8907-40bab9c54802',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 4: {
        await knex('product_category').insert(
          [
            {
              product_id: '2464fe26-78fb-4354-bd96-9e620257e9ae',
              category_id: categoryId,
            },
            {
              product_id: 'cce8f5f3-babc-4b1c-8948-3ff58ca48b08',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 5: {
        await knex('product_category').insert(
          [
            {
              product_id: '7be28d68-8217-46f7-a636-abba17268af3',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 6: {
        await knex('product_category').insert(
          [
            {
              product_id: '7be28d68-8217-46f7-a636-abba17268af3',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 7: {
        await knex('product_category').insert(
          [
            {
              product_id: '4be46d88-d34b-4e59-8907-40bab9c54802',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 8: {
        await knex('product_category').insert(
          [
            {
              product_id: '2464fe26-78fb-4354-bd96-9e620257e9ae',
              category_id: categoryId,
            },
          ],
          ['product_id', 'category_id']
        );
        break;
      }
      case 9: {
        continue;
      }
    }
  }
};
