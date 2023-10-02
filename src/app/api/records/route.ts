import { NextResponse } from "next/server";
import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";
import { calculateLeaderboardResult } from "../leaderboards/services";

export async function GET() {
  let connection: PoolConnection | null = null;
  
  try {
    connection = await getConnection();
    const [rows] = await connection.query("SELECT * FROM records");
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
    const { name, data } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    
    const dataArr = JSON.parse(data);

    let results: any[] = [];
    dataArr.forEach(async (element: any) => {
      const [result] = await connection.query("INSERT INTO records (name, fieldId, fieldValue) VALUES (?, ?, ?)", [name, element.fieldId, element.value]);

      results.push(result)
    });

    await calculateLeaderboardResult();

    return NextResponse.json(results);
  } catch (error: any) {
    return new NextResponse(error, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
