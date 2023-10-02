import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";

export async function GET(req: Request) {
let connection: PoolConnection | null = null;
  try {
    connection = await getConnection();

    const { searchParams } = new URL(req.url);
    let page = searchParams.get('page') || 0;
    page = Number(page) - 1;
    let pageSize = searchParams.get('pageSize') || 10;
    pageSize = Number(pageSize);

    const [countResult] = await connection.query("SELECT COUNT(*) AS total FROM leaderboards");
    const leaderboardsCount = countResult[0].total;

    const [rows] = await connection.query("SELECT * FROM leaderboards ORDER BY id ASC LIMIT ? OFFSET ?", [pageSize, page * pageSize]);

    const totalPages = Math.ceil(leaderboardsCount / pageSize);

    return NextResponse.json({
      totalPages: totalPages,
      data: rows,
    });
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
