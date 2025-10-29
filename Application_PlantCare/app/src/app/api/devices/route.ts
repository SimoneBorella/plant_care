import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("plantcare");
    const devicesCollection = db.collection("devices");

    const devices = await devicesCollection.find({}).toArray();

    const serialized = devices.map((d) => ({
      ...d,
      _id: d._id.toString(),
      last_seen: d.last_seen ? d.last_seen.toISOString() : null,
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}
