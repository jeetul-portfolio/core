function makeUpdateProfileByIdDataAccess({ logger, mysqlPool }) {
  return async function updateProfileByIdDataAccess({
    id,
    fullName,
    email,
    phone = null,
    location = null,
    linkedin = null,
    github = null,
    website = null,
    headline = null,
    bio = null,
    avatarUrl = null,
    isPublic = true,
  }) {
    try {
      const [result] = await mysqlPool.query(
        `
          UPDATE profiles
          SET
            full_name = ?,
            email = ?,
            phone = ?,
            location = ?,
            linkedin_url = ?,
            github_url = ?,
            website_url = ?,
            headline = ?,
            bio = ?,
            avatar_url = ?,
            is_public = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          fullName,
          email,
          phone,
          location,
          linkedin,
          github,
          website,
          headline,
          bio,
          avatarUrl,
          isPublic ? 1 : 0,
          id,
        ],
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Database query failed in updateProfileByIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpdateProfileByIdDataAccess;
