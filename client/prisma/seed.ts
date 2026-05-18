import { PrismaClient, SensorType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const facilities = [
  {
    id: "facility_001",
    name: "Riverfront Textile ETP",
    location: "Mumbai, India",
    latitude: 19.076,
    longitude: 72.8777,
    industry: "Textile",
    licenseNo: "WIA-82-TX-001",
  },
  {
    id: "facility_002",
    name: "Delta Chemical Works",
    location: "Delhi, India",
    latitude: 28.6139,
    longitude: 77.209,
    industry: "Chemical",
    licenseNo: "WIA-82-CH-002",
  },
  {
    id: "facility_003",
    name: "Green Foods Processing",
    location: "Bengaluru, India",
    latitude: 12.9716,
    longitude: 77.5946,
    industry: "Food Processing",
    licenseNo: "WIA-82-FP-003",
  },
];

const sensorTypes: SensorType[] = [
  "PH",
  "COD",
  "BOD",
  "TSS",
  "TEMPERATURE",
  "HEAVY_METAL_LEAD",
  "HEAVY_METAL_MERCURY",
  "AMMONIA",
  "DISSOLVED_OXYGEN",
  "TURBIDITY",
];

async function main() {
  const password = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@aquaflow.local" },
    update: {},
    create: {
      email: "admin@aquaflow.local",
      name: "Aquaflow Admin",
      password,
      role: "ADMIN",
    },
  });

  for (const f of facilities) {
    const facility = await prisma.facility.upsert({
      where: { licenseNo: f.licenseNo },
      update: { name: f.name, location: f.location, industry: f.industry, latitude: f.latitude, longitude: f.longitude },
      create: f,
    });

    for (const type of sensorTypes) {
      const unit = type === "PH" ? "pH" : type === "TEMPERATURE" ? "°C" : type === "TURBIDITY" ? "NTU" : "mg/L";
      await prisma.sensor.create({
        data: {
          facilityId: facility.id,
          type,
          unit,
          location: "Outlet A",
        },
      }).catch(() => null);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
