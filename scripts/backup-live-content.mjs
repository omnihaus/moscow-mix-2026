import { mkdir, writeFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, terminate } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAzy5WSDJ8gc_WKPHb0GwrxLeIbslbem-U',
  authDomain: 'moscowmix-web.firebaseapp.com',
  projectId: 'moscowmix-web',
  storageBucket: 'moscowmix-web.firebasestorage.app',
  messagingSenderId: '399364599390',
  appId: '1:399364599390:web:ec89aacb9d936769c38ecf',
};

const app = initializeApp(firebaseConfig, `content-backup-${Date.now()}`);
const db = getFirestore(app);

try {
  const snapshot = await getDoc(doc(db, 'moscow_mix', 'live_site'));

  if (!snapshot.exists()) {
    throw new Error('The Firebase live_site document was not found.');
  }

  const live = snapshot.data();
  const content = {
    capturedAt: new Date().toISOString(),
    firebaseProject: firebaseConfig.projectId,
    document: 'moscow_mix/live_site',
    heroHeadline: live.heroHeadline ?? null,
    heroSubheadline: live.heroSubheadline ?? null,
    assets: live.assets ?? {},
    products: live.products ?? [],
    blogPosts: live.blogPosts ?? [],
    story: live.story ?? null,
  };

  const timestamp = content.capturedAt.replaceAll(':', '-').replaceAll('.', '-');
  const directory = new URL('../backups/', import.meta.url);
  const output = new URL(`moscow-mix-content-${timestamp}.json`, directory);

  await mkdir(directory, { recursive: true });
  await writeFile(output, `${JSON.stringify(content, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });

  console.log(`Saved ${content.blogPosts.length} posts and ${content.products.length} products.`);
  console.log(output.pathname);
} finally {
  await terminate(db);
}
