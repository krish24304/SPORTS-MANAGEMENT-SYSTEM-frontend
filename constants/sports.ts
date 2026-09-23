export const sports = [
  {
    id: 1,
    name: "Badminton",
    status: "Available",
    totalGear: 31,
    availableGear: 21,
    resourceTypes: [
      {
        id: 1,
        name: "Court",
        total: 3,
        available: 2,
        units: [
          {
            id: 1,
            name: "Court 1",
            status: "available",
          },
          {
            id: 2,
            name: "Court 2",
            status: "booked",
          },
          {
            id: 3,
            name: "Court 3",
            status: "available",
          },
        ],
      },
      {
        id: 2,
        name: "Racket",
        total: 8,
        available: 5,
        units: [],
      },
      {
        id: 3,
        name: "Shuttle",
        total: 20,
        available: 14,
        units: [],
      },
    ],
  },

  {
    id: 2,
    name: "Table Tennis",
    status: "Limited",
    totalGear: 20,
    availableGear: 11,
    resourceTypes: [
      {
        id: 4,
        name: "Table",
        total: 2,
        available: 0,
        units: [
          {
            id: 4,
            name: "Table 1",
            status: "booked",
          },
          {
            id: 5,
            name: "Table 2",
            status: "maintenance",
          },
        ],
      },
      {
        id: 5,
        name: "Bat",
        total: 6,
        available: 3,
        units: [],
      },
      {
        id: 6,
        name: "Ball",
        total: 12,
        available: 8,
        units: [],
      },
    ],
  },

  {
    id: 3,
    name: "Basketball",
    status: "Available",
    totalGear: 11,
    availableGear: 8,
    resourceTypes: [
      {
        id: 7,
        name: "Court",
        total: 1,
        available: 1,
        units: [
          {
            id: 7,
            name: "Main Court",
            status: "available",
          },
        ],
      },
      {
        id: 8,
        name: "Basketball",
        total: 10,
        available: 7,
        units: [],
      },
    ],
  },

  {
    id: 4,
    name: "Football",
    status: "Unavailable",
    totalGear: 9,
    availableGear: 0,
    resourceTypes: [
      {
        id: 9,
        name: "Ground",
        total: 1,
        available: 0,
        units: [
          {
            id: 9,
            name: "Football Ground",
            status: "booked",
          },
        ],
      },
      {
        id: 10,
        name: "Football",
        total: 8,
        available: 0,
        units: [],
      },
    ],
  },
];