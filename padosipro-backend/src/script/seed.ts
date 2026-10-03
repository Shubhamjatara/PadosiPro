import prisma from "../db/PrismaClient";

const tasks = [
  // Home Services
  {
    name: "Plumbing",
    category: "Home Services",
    description:
      "Fix leaking taps, pipes, water connections and plumbing issues.",
  },
  {
    name: "Electrician",
    category: "Home Services",
    description: "Handle electrical installation, wiring and repair work.",
  },
  {
    name: "Carpentry",
    category: "Home Services",
    description: "Furniture repair, woodwork and basic carpentry services.",
  },
  {
    name: "Painting",
    category: "Home Services",
    description: "Interior and exterior wall painting services.",
  },

  // Cleaning
  {
    name: "Home Cleaning",
    category: "Cleaning",
    description: "General cleaning services for homes and apartments.",
  },
  {
    name: "Deep Cleaning",
    category: "Cleaning",
    description:
      "Detailed cleaning of rooms, kitchens, bathrooms and other areas.",
  },
  {
    name: "Bathroom Cleaning",
    category: "Cleaning",
    description: "Professional cleaning and sanitization of bathrooms.",
  },
  {
    name: "Kitchen Cleaning",
    category: "Cleaning",
    description: "Cleaning of kitchen surfaces, cabinets and appliances.",
  },

  // Repair & Maintenance
  {
    name: "AC Repair",
    category: "Repair & Maintenance",
    description: "Air conditioner inspection, servicing and repair.",
  },
  {
    name: "Refrigerator Repair",
    category: "Repair & Maintenance",
    description: "Repair and maintenance of refrigerators.",
  },
  {
    name: "Washing Machine Repair",
    category: "Repair & Maintenance",
    description: "Repair and servicing of washing machines.",
  },
  {
    name: "TV Repair",
    category: "Repair & Maintenance",
    description: "Television troubleshooting and repair services.",
  },

  // Beauty & Personal Care
  {
    name: "Haircut",
    category: "Beauty & Personal Care",
    description: "Haircut and basic hair grooming services.",
  },
  {
    name: "Home Salon",
    category: "Beauty & Personal Care",
    description: "Salon and grooming services provided at home.",
  },
  {
    name: "Makeup Artist",
    category: "Beauty & Personal Care",
    description: "Professional makeup services for events and occasions.",
  },
  {
    name: "Mehndi Artist",
    category: "Beauty & Personal Care",
    description: "Mehndi and henna design services.",
  },

  // Automotive
  {
    name: "Car Washing",
    category: "Automotive",
    description: "Car washing and exterior cleaning services.",
  },
  {
    name: "Bike Washing",
    category: "Automotive",
    description: "Bike washing and cleaning services.",
  },
  {
    name: "Car Servicing",
    category: "Automotive",
    description: "Routine car inspection and servicing.",
  },
  {
    name: "Bike Servicing",
    category: "Automotive",
    description: "Routine bike inspection and servicing.",
  },

  // Moving & Delivery
  {
    name: "Packers and Movers",
    category: "Moving & Delivery",
    description: "Packing and moving household or office items.",
  },
  {
    name: "Local Delivery",
    category: "Moving & Delivery",
    description: "Local pickup and delivery services.",
  },
  {
    name: "Furniture Moving",
    category: "Moving & Delivery",
    description: "Moving and transportation of furniture and large items.",
  },
  {
    name: "Courier Service",
    category: "Moving & Delivery",
    description: "Local courier pickup and delivery services.",
  },
];

async function main() {
  console.log("Seeding tasks...");

  // Optional: clear existing tasks before seeding
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: tasks,
  });

  console.log(`${tasks.length} tasks created successfully.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
