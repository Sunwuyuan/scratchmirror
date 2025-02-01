const { PrismaClient } = require("@prisma/client");

const useDatabase = process.env.USE_DATABASE === 'true';
console.log(useDatabase===true?'使用数据库':'不使用数据库');
const prisma = useDatabase ? new PrismaClient() : null;

function parseDate(dateString) {
  return dateString === "1900-01-01T00:00:00.000Z" ? null : dateString;
}

async function cacheUser(userData) {
  if (!useDatabase) return;

  await prisma.scratchmirror_users.upsert({
    where: { id: userData.id },
    update: {
      username: userData.username || null,
      scratchteam: userData.scratchteam ? 1 : 0,
      history_joined: parseDate(userData.history?.joined),
      profile_id: userData.profile?.id || null,
      status: userData.profile?.status || null,
      bio: userData.profile?.bio || null,
      country: userData.profile?.country || null,
    },
    create: {
      id: userData.id,
      username: userData.username || null,
      scratchteam: userData.scratchteam ? 1 : 0,
      history_joined: parseDate(userData.history?.joined),
      profile_id: userData.profile?.id || null,
      status: userData.profile?.status || null,
      bio: userData.profile?.bio || null,
      country: userData.profile?.country || null,
    },
  });
}

async function cacheUsers(usersData) {
  if (!useDatabase) return;

  for (const userData of usersData) {
    await cacheUser(userData);
  }
}

async function cacheProject(projectData) {
  if (!useDatabase) return;

  const authorData = projectData.author || {
    id: projectData.creator_id,
    username: projectData.username,
    profile: {
      images: projectData.avatar,
    },
  };

  await cacheUser(authorData);

  await prisma.scratchmirror_projects.upsert({
    where: { id: projectData.id },
    update: {
      title: projectData.title || null,
      description: projectData.description || null,
      instructions: projectData.instructions || null,
      visibility: projectData.visibility || "visible",
      public: projectData.public || null,
      comments_allowed: projectData.comments_allowed || null,
      is_published: projectData.is_published || null,
      author_id: authorData.id,
      image: projectData.image || null,
      history_created_at: parseDate(projectData.history?.created) || null,
      history_modified_at: parseDate(projectData.history?.modified) || null,
      history_shared_at: parseDate(projectData.history?.shared) || null,
      stats_views: projectData.stats?.views || null,
      stats_loves: projectData.stats?.loves || null,
      stats_favorites: projectData.stats?.favorites || null,
      stats_remixes: projectData.stats?.remixes || null,
      remix_parent: projectData.remix?.parent || null,
      remix_root: projectData.remix?.root || null,
    },
    create: {
      id: projectData.id,
      title: projectData.title || null,
      description: projectData.description || null,
      instructions: projectData.instructions || null,
      visibility: projectData.visibility || "visible",
      public: projectData.public || null,
      comments_allowed: projectData.comments_allowed || null,
      is_published: projectData.is_published || null,
      author_id: authorData.id,
      image: projectData.image || null,
      history_created_at: parseDate(projectData.history?.created) || null,
      history_modified_at: parseDate(projectData.history?.modified) || null,
      history_shared_at: parseDate(projectData.history?.shared) || null,
      stats_views: projectData.stats?.views || null,
      stats_loves: projectData.stats?.loves || null,
      stats_favorites: projectData.stats?.favorites || null,
      stats_remixes: projectData.stats?.remixes || null,
      remix_parent: projectData.remix?.parent || null,
      remix_root: projectData.remix?.root || null,
    },
  });
}

async function cacheProjects(projectsData) {
  if (!useDatabase) return;

  for (const projectData of projectsData) {
    await cacheProject(projectData);
  }
}

module.exports = { cacheUser, cacheUsers, cacheProject, cacheProjects };
