const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), '.data', 'photos');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function storePhoto(buffer, originalname, mimetype) {
  ensureDataDir();
  const id = crypto.createHash('sha256').update(buffer).digest('hex');
  const filePath = path.join(DATA_DIR, id);
  const metaPath = path.join(DATA_DIR, `${id}.json`);

  const metadata = {
    id,
    originalname: originalname || 'photo.png',
    size: buffer.length,
    mimeType: mimetype || 'image/png',
    createdAt: new Date().toISOString()
  };

  await fs.promises.writeFile(filePath, buffer);
  await fs.promises.writeFile(metaPath, JSON.stringify(metadata, null, 2));

  return metadata;
}

async function getPhotoMetadata(id) {
  ensureDataDir();
  const metaPath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(metaPath)) {
    return null;
  }
  const content = await fs.promises.readFile(metaPath, 'utf8');
  return JSON.parse(content);
}

async function getPhotoContent(id) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, id);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const metadata = await getPhotoMetadata(id);
  const buffer = await fs.promises.readFile(filePath);
  return { buffer, metadata };
}

module.exports = {
  storePhoto,
  getPhotoMetadata,
  getPhotoContent,
  DATA_DIR
};
