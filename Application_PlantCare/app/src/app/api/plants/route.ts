import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("plantcare");

    const plants = await db.collection("plants").find({}).toArray();

    return NextResponse.json(plants);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}







export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("plantcare");
    const body = await req.json();

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: name and type" },
        { status: 400 }
      );
    }

    const newPlant = {
      name: body.name,
      type: body.type,
      description: body.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("plants").insertOne(newPlant);

    return NextResponse.json(
      { message: "Plant added", plant: { _id: result.insertedId, ...newPlant } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add plant" }, { status: 500 });
  }
}






export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("plantcare");

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ error: "Missing plant name" }, { status: 400 });
    }

    const result = await db.collection("plants").deleteOne({ name });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `Plant '${name}' deleted successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
  }
}
