import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { calculateLeaderboardResult } from "../../leaderboards/services";

export async function GET(req: Request, { params }: { params: { id: number } }) {
  let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();

    if (!params.id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const [rows] = await connection.query("SELECT * FROM records WHERE id = ?", [params.id]);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function DELETE(req: Request, { params }: { params: { id: number } }) {
  let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();

    if (!params.id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const [deleteResult] = await connection.query("DELETE FROM records WHERE id = ?", [params.id]);

    if (deleteResult.affectedRows === 0) {
      return new NextResponse("Record not found", { status: 404 });
    }

    await calculateLeaderboardResult(); 

    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
