import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { name: string } }) {
  let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();

    if (!params.name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const [rows] = await connection.query("SELECT *, (SELECT name FROM fields WHERE fields.id = records.fieldId) as fieldName FROM records WHERE BINARY name = ?", [params.name]);

    return NextResponse.json(rows);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
