import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { calculateLeaderboardResult } from "../leaderboards/services";

export async function GET() {
  let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();
    const [rows] = await connection.query("SELECT * FROM fields ORDER BY priority ASC");
    return NextResponse.json(rows);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(req: Request) {
  let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();
    const body = await req.json();

    if (!Array.isArray(body)) {
      throw new Error('Invalid data format. Expected an array.');
    }

    const result = [];
    for (const fields of body) {
      if (fields.id) {
        delete fields.created_at;
        const [updatedItem] = await connection.query(
          "UPDATE fields SET ? WHERE id = ?",
          [{ ...fields, updated_at: new Date() }, fields.id]
        );
        result.push({ operation: 'update', data: updatedItem });
      } else {
        const [insertedItem] = await connection.query("INSERT INTO fields SET ?", fields);
        result.push({ operation: 'create', data: insertedItem });
      }
    }

    await calculateLeaderboardResult();

    const totalCount = result.length;
    const createdCount = result.filter((res) => res.operation === 'create').length;
    const updatedCount = result.filter((res) => res.operation === 'update').length;

    const response = {
      createdCount: createdCount,
      updatedCount: updatedCount,
      totalCount: totalCount,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
