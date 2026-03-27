function makeUpsertProfileByUserIdDataAccess({ logger, mysqlPool }) {
  return async function upsertProfileByUserIdDataAccess({
    profileId,
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
      if (profileId) {
        await mysqlPool.query(
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
            profileId,
          ],
        );

        return profileId;
      }

      const [result] = await mysqlPool.query(
        `
          INSERT INTO profiles (
            full_name,
            email,
            phone,
            location,
            linkedin_url,
            github_url,
            website_url,
            headline,
            bio,
            avatar_url,
            is_public,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
        ],
      );

      return result.insertId;
    } catch (error) {
      logger.error('Database query failed in upsertProfileByUserIdDataAccess:', error.message);
      throw error;
    }
  };
}

module.exports = makeUpsertProfileByUserIdDataAccess;
