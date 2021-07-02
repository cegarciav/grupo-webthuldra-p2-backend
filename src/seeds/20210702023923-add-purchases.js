module.exports = {
  up: async (queryInterface) => {
    const purchases = [
      {
        dealId: '2927c6bb-d0c4-4583-b75f-e21f1a30b497',
        productId: 'a9aa09e7-83f8-4e95-b551-273cedf0afe3',
        amount: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '2927c6bb-d0c4-4583-b75f-e21f1a30b497',
        productId: 'a3de523e-a264-4479-b1e9-d1da5d228caf',
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '107eb0de-e4eb-414e-b51c-debeca8a781e',
        productId: '90d7709c-74c7-492d-b3a4-f2eb0b05b43e',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '107eb0de-e4eb-414e-b51c-debeca8a781e',
        productId: '258d71fd-9415-4115-b243-aa27ebecb9ae',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'fcc162b6-b0bc-4913-8e98-7ad316eb91ee',
        productId: '143bea53-ec84-48a1-b1a2-ea820408af13',
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'fcc162b6-b0bc-4913-8e98-7ad316eb91ee',
        productId: '90899810-e1d6-4ede-8833-a030f266aa42',
        amount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'b7a1fdba-057a-421c-a525-4cbbfe2ed066',
        productId: 'fe77bbc1-3cbe-4640-b573-b89cdc30a77f',
        amount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'b7a1fdba-057a-421c-a525-4cbbfe2ed066',
        productId: '3916213b-0f90-4242-88b5-32e27050fe5f',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '14cd2e63-9dd5-41e5-a82f-bfe2f53881bb',
        productId: '79bb4819-4ada-4e60-b5fa-2f488259a4f1',
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '14cd2e63-9dd5-41e5-a82f-bfe2f53881bb',
        productId: '90899810-e1d6-4ede-8833-a030f266aa42',
        amount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '80081ea3-db4c-431b-b491-4b12684f435f',
        productId: '9b204198-141c-4185-927e-0f99f5a0388f',
        amount: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '80081ea3-db4c-431b-b491-4b12684f435f',
        productId: 'fe77bbc1-3cbe-4640-b573-b89cdc30a77f',
        amount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '0a38588a-8df8-4776-a3f0-85085d9d686c',
        productId: 'db6ed143-70d6-4d56-a800-216e89712fbb',
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '0a38588a-8df8-4776-a3f0-85085d9d686c',
        productId: '92bc1590-5d87-4a5d-b74a-4016372e1185',
        amount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'bf520321-8e4f-4f06-9b49-0804ff5b2968',
        productId: '836fa52e-cece-4a60-ac9d-dabc46e50814',
        amount: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'bf520321-8e4f-4f06-9b49-0804ff5b2968',
        productId: 'a3de523e-a264-4479-b1e9-d1da5d228caf',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '5e69289b-795c-460b-9282-a97e1a70e855',
        productId: '258d71fd-9415-4115-b243-aa27ebecb9ae',
        amount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: '5e69289b-795c-460b-9282-a97e1a70e855',
        productId: '701059f7-2757-4e88-9e9a-d3c16dad89f1',
        amount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'ee5371c9-f0c2-46c7-9ad5-2abbf85691c0',
        productId: '206e2eb6-adb5-4811-a1fa-5013f8776dab',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dealId: 'ee5371c9-f0c2-46c7-9ad5-2abbf85691c0',
        productId: 'db6ed143-70d6-4d56-a800-216e89712fbb',
        amount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('purchases', purchases, {});
  },

  down: async (queryInterface) => queryInterface.bulkDelete('purchases', null, {
    restartIdentity: true,
    truncate: true,
    cascade: true,
  }),
};
