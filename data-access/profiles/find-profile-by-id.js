function makeFindProfileByIdDataAccess({ logger, mysqlPool }) {
  return async function findProfileByIdDataAccess({ id }) {
    try {
      const [rows] = await mysqlPool.query(
        `
          SELECT
            id,
            full_name AS fullName,
            email,
            phone,
            location,
            linkedin_url AS linkedin,
            github_url AS github,
            website_url AS website,
            headline,
            bio,
            avatar_url AS avatarUrl,
            is_public AS isPublic,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM profiles
          WHERE id = ?
          LIMIT 1
        `,
        [id],
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findProfileByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindProfileByIdDataAccess;
