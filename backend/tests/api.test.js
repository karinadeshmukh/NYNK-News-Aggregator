const test = require('node:test');
const assert = require('node:assert');

test('Backend Logic & Store Integration Tests', async (t) => {
  const { store } = require('../dist/services/store.js');
  const { newsIngestionService } = require('../dist/services/newsIngestionService.js');
  const { clusterSyncService } = require('../dist/services/clusterSyncService.js');
  const { hashPassword, verifyPassword } = require('../dist/controllers/authController.js');

  await t.test('Seed initial multi-perspective news', async () => {
    await newsIngestionService.seedInitialMultiPerspectiveNews();
    const articles = await store.getArticles();
    assert.ok(articles.length >= 10, `Expected at least 10 articles, got ${articles.length}`);
    
    const perspectives = new Set(articles.map(a => a.perspective));
    assert.ok(perspectives.has('Official'), 'Must include Official (PIB)');
    assert.ok(perspectives.has('Left'), 'Must include Left');
    assert.ok(perspectives.has('Center'), 'Must include Center');
    assert.ok(perspectives.has('Right'), 'Must include Right');
  });

  await t.test('Cluster synchronization and blindspot detection', async () => {
    const updatedCount = await clusterSyncService.syncClusters();
    assert.ok(updatedCount > 0, `Clusters should have synced, got ${updatedCount}`);

    const clusters = await store.getClusters();
    assert.ok(clusters.length > 0, 'Should have created clusters in store');

    const firstCluster = clusters[0];
    assert.ok(firstCluster.title, 'Cluster should have a title');
    assert.ok(firstCluster.perspectives, 'Cluster should have perspectives breakdown');

    const blindspots = await store.getBlindspots();
    assert.ok(Array.isArray(blindspots), 'Blindspots should be returned');
  });

  await t.test('Secure password hashing & verification', async () => {
    const rawPassword = 'SuperSecretPassword2026!';
    const hashed = hashPassword(rawPassword);
    assert.notStrictEqual(hashed, rawPassword);
    assert.ok(hashed.includes(':'), 'Should contain salt:hash delimiter');
    assert.ok(verifyPassword(rawPassword, hashed), 'Password should verify correctly');
    assert.strictEqual(verifyPassword('WrongPassword', hashed), false, 'Wrong password must fail');
  });

  await t.test('User registration, role assignment & preferences', async () => {
    const hashed = hashPassword('editorSecret123');
    const user = await store.createUser({
      email: 'editor@nynk.news',
      name: 'Senior Editor',
      password_hash: hashed,
      role: 'editor',
      preferred_topics: ['Technology', 'Economy'],
      preferred_perspectives: ['Center', 'Official'],
      bookmarked_cluster_ids: ['cluster_semi_01']
    });

    assert.strictEqual(user.email, 'editor@nynk.news');
    assert.strictEqual(user.role, 'editor');

    const fetched = await store.findUserByEmail('editor@nynk.news');
    assert.ok(fetched, 'User should be found in store');
    assert.strictEqual(fetched.name, 'Senior Editor');
    assert.deepStrictEqual(fetched.bookmarked_cluster_ids, ['cluster_semi_01']);

    // Update preferences
    await store.updateUser('editor@nynk.news', {
      preferred_topics: ['Technology', 'Governance']
    });
    const updated = await store.findUserByEmail('editor@nynk.news');
    assert.deepStrictEqual(updated.preferred_topics, ['Technology', 'Governance']);
  });
});
