function makeFindPublicProfileDataAccess({ logger, mysqlPool }) {
  return async function findPublicProfileDataAccess() {
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
          WHERE is_public = 1
          ORDER BY updated_at DESC
          LIMIT 1
        `,
      );

      return rows[0] || null;
    } catch (error) {
      logger.error('Database query failed in findPublicProfileDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeFindPublicProfileDataAccess;
