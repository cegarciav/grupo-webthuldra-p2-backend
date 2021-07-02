module.exports = {
  up: async (queryInterface) => {
    const deals = [
      {
        id: '2927c6bb-d0c4-4583-b75f-e21f1a30b497',
        status: 'abierto',
        customerId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        storeId: '6f4e5985-2ff8-4118-bbaf-e6004d757c13',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '107eb0de-e4eb-414e-b51c-debeca8a781e',
        status: 'completado',
        customerId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        storeId: '3e7ca498-8646-4493-bce6-b8cad8c5908e',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'fcc162b6-b0bc-4913-8e98-7ad316eb91ee',
        status: 'abierto',
        customerId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        storeId: '9440a98a-2973-484b-b8bd-78beb6b24eef',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b7a1fdba-057a-421c-a525-4cbbfe2ed066',
        status: 'abierto',
        customerId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        storeId: 'bdf7fee3-9ea8-4258-b23a-8d14fb2da86b',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '14cd2e63-9dd5-41e5-a82f-bfe2f53881bb',
        status: 'abierto',
        customerId: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        storeId: '9440a98a-2973-484b-b8bd-78beb6b24eef',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '80081ea3-db4c-431b-b491-4b12684f435f',
        status: 'rechazado',
        customerId: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        storeId: 'bdf7fee3-9ea8-4258-b23a-8d14fb2da86b',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '0a38588a-8df8-4776-a3f0-85085d9d686c',
        status: 'completado',
        customerId: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        storeId: '29624628-d81a-41b1-ba54-bd096356eb48',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bf520321-8e4f-4f06-9b49-0804ff5b2968',
        status: 'rechazado',
        customerId: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        storeId: '6f4e5985-2ff8-4118-bbaf-e6004d757c13',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5e69289b-795c-460b-9282-a97e1a70e855',
        status: 'completado',
        customerId: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        storeId: '3e7ca498-8646-4493-bce6-b8cad8c5908e',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'ee5371c9-f0c2-46c7-9ad5-2abbf85691c0',
        status: 'abierto',
        customerId: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        storeId: '29624628-d81a-41b1-ba54-bd096356eb48',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('deals', deals, {});
  },

  down: async (queryInterface) => queryInterface.bulkDelete('deals', null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  }),
};
