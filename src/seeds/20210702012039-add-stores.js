module.exports = {
  up: async (queryInterface) => {
    const stores = [
      {
        id: '6f4e5985-2ff8-4118-bbaf-e6004d757c13',
        address: 'Muy Muy Lejano 123',
        name: 'Tienda de Carlos',
        description: 'Vendo brownies',
        ownerId: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3e7ca498-8646-4493-bce6-b8cad8c5908e',
        address: 'Muy Muy Cercano 321',
        name: 'Tienda de Carlos 2',
        description: 'Vendo postres mágicos',
        ownerId: '7d13c742-cd2d-45b7-9866-20dbb0eaa2e9',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '9440a98a-2973-484b-b8bd-78beb6b24eef',
        address: 'Campus Central',
        name: 'Tienda de Ari',
        description: 'Vendo pasteles',
        ownerId: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bdf7fee3-9ea8-4258-b23a-8d14fb2da86b',
        address: 'Campus Oriente',
        name: 'Tienda de Ari 2',
        description: 'Vendo postres',
        ownerId: '26cbed2e-b38c-461e-a387-977a6cbff6dc',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '29624628-d81a-41b1-ba54-bd096356eb48',
        address: 'Arendelle 666',
        name: 'Tienda de Camilo',
        description: 'Vendo hielo',
        ownerId: '96ab7b63-915e-442b-b83f-e0962bd2c8d8',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('stores', stores, {});
  },

  down: async (queryInterface) => queryInterface.bulkDelete('stores', null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  }),
};
