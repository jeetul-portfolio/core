function makeGetProfilesDataAccess({ logger, mysqlPool }) {
  return async function getProfilesDataAccess() {
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
          ORDER BY updated_at DESC, id DESC
        `,
      );

      return rows;
    } catch (error) {
      logger.error('Database query failed in getProfilesDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeGetProfilesDataAccess;
