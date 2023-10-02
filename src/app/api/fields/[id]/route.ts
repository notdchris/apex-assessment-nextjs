import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { calculateLeaderboardResult } from "../../leaderboards/services";

export async function GET(req: Request, { params }: { params: { id: number } }) {
  try {
    if (!params.id) {
      return new NextResponse("id is required", { status: 400 });
    }

    let connection: PoolConnection | null = null;
    try {
      connection = await getConnection();

      const [rows] = await connection.query("SELECT * FROM fields WHERE id = ?", [
        Number(params.id),
      ]);

      if (rows.length === 0) {
        return new NextResponse("Record not found", { status: 404 });
      }

      return NextResponse.json(rows[0]);
    } catch (error: any) {
      return new NextResponse(error.stack, { status: 500 });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    return new NextResponse(error, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: number } }) {
  try {
    if (!params.id) {
      return new NextResponse("id is required", { status: 400 });
    }

    let connection: PoolConnection | null = null;
    try {
      connection = await getConnection();

      const [deleteResult] = await connection.query("DELETE FROM fields WHERE id = ?", [
        Number(params.id),
      ]);

      if (deleteResult.affectedRows === 0) {
        return new NextResponse("Record not found", { status: 404 });
      }

      await calculateLeaderboardResult();

      return NextResponse.json({ message: "Record deleted successfully" });
    } catch (error: any) {
      return new NextResponse(error.stack, { status: 500 });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    return new NextResponse(error, { status: 500 });
  }
}
