import { PoolConnection } from "mysql2/promise";
import { getConnection } from "@/lib/db";

async function calculateByFields(fields: Field[], connection: PoolConnection) {
  let resultCollection: any[] = [];

  for (let i = 0; i < fields.length; i++) {
    const { id, mechanism, sort, type } = fields[i];
  
    let query = '';
    if (mechanism === 'MAX') {
      if (type === 'TEXT') {
        query = `SELECT fieldId, name, MAX(CAST(fieldValue AS SIGNED)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      } else {
        query = `SELECT fieldId, name, MAX(CAST(fieldValue AS DECIMAL)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      }
    } else if (mechanism === 'MIN') {
      if (type === 'TEXT') {
        query = `SELECT fieldId, name, MIN(CAST(fieldValue AS SIGNED)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      } else {
        query = `SELECT fieldId, name, MIN(CAST(fieldValue AS DECIMAL)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      }
    } else {
      if (type === 'TEXT') {
        query = `SELECT fieldId, name, SUM(CAST(fieldValue AS SIGNED)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      } else {
        query = `SELECT fieldId, name, SUM(CAST(fieldValue AS DECIMAL)) as totalValue FROM records WHERE fieldId = ? GROUP BY fieldId, name ORDER BY totalValue ${sort}`;
      }
    }
  
    const [queryResult] = await connection.execute(query, [id]);

    queryResult.forEach((row) => {
      const name = row.name;
      if (!resultCollection[name]) {
        resultCollection[name] = [];
      }
      resultCollection[name].push(row);
    });
  }

  return resultCollection;
}

export const calculateLeaderboardResult = async () => {
  let connection: PoolConnection | null = null;

  try {
    connection = await getConnection();
    
    const [allFields] = await connection.query("SELECT * FROM fields ORDER BY priority ASC");
    const [countResult] = await connection.query("SELECT COUNT(*) as count FROM records");

    if (countResult[0].count > 0) {
      const leaderboardResults = await calculateByFields(allFields, connection);

      const existingLeaderboardsQuery = "SELECT * FROM leaderboards ORDER BY id ASC";
      const [existingLeaderboards] = await connection.query(existingLeaderboardsQuery);

      const existingLeaderboardCount = existingLeaderboards.length;

      let rank = 1;
      for (const name in leaderboardResults) {
        if (leaderboardResults.hasOwnProperty(name)) {
          const resultArray = leaderboardResults[name];
          const data = JSON.stringify(resultArray);
        
          const checkRankExist = existingLeaderboards.find((record) => record.id === rank);
        
          if (checkRankExist) {
            const updateLeaderboardQuery = "UPDATE leaderboards SET name = ?, data = ?, updated_at = ? WHERE id = ?";
            await connection.query(updateLeaderboardQuery, [name, data, new Date(), rank]);
          } else {
            const createLeaderboardQuery = "INSERT INTO leaderboards (id, name, data) VALUES (?, ?, ?)";
            await connection.query(createLeaderboardQuery, [rank, name, data]);
          }
        }
      
        rank++;
      }

      if (existingLeaderboardCount > leaderboardResults.length) {
        const leaderboardsToDelete = existingLeaderboards.slice(leaderboardResults.length);
        for (const leaderboard of leaderboardsToDelete) {
          const deleteLeaderboardQuery = "DELETE FROM leaderboards WHERE id = ?";
          await connection.query(deleteLeaderboardQuery, [leaderboard.rank]);
        }
      }
    }
  } catch (error: any) {
    console.error(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
