import { unzip } from "unzipit"
import iconv from 'iconv-lite';
import type { ZipEntry } from "unzipit";

export default class AssetStorage {
  private db: Promise<IDBDatabase>;
  private entriesCache: {[type: string]: {[key: string]: ZipEntry}} = {};
  private pendingRequests: Record<string, Promise<Blob>> = {};

  constructor() {
    this.db = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open('assets_db', 1);
      request.addEventListener('error', () => {
        console.error('Database failed to open');
        reject();
      });
      request.addEventListener('success', () => {
        console.log('Database opened successfully');

        resolve(request.result)
      });

      request.addEventListener('upgradeneeded', () => {
        const db = request.result;

        const objectStore = db.createObjectStore('assets_os', { keyPath: 'name' });
        objectStore.createIndex('asset', 'asset', { unique: false });

        console.log('Database setup complete');
        resolve(request.result)
      });
    });
  }

  public getAsset(id: string, type: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const db = await this.db;
      const objectStore = db.transaction('assets_os').objectStore('assets_os');
      const request = objectStore.get(`${type}_${id}`);
  
      request.addEventListener('success', async () => {
        try {
          if(request.result) {
            resolve(URL.createObjectURL(request.result.asset));
          }
          else {
            if (!this.pendingRequests[id])
              this.pendingRequests[id] = this.fetchAsset(id, type);
            
            const asset = await this.pendingRequests[id];
            delete this.pendingRequests[id];
            resolve(URL.createObjectURL(asset));
          }
        }
        catch (error) {
          reject(error);
        }
      });
    })
  }

  private async fetchAsset(id: string, type: string) {
    console.debug(`Fetching asset "${id}" from "${type}.dat"`);

    let entries: {[key: string]: ZipEntry} = {};
    if (this.entriesCache[type])
      entries = this.entriesCache[type];
    else
      entries = (await unzip(`${import.meta.env.VITE_DATA_URI}/${type}.dat`)).entries;
    const files = Object.keys(entries);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = iconv.decode(Buffer.from(entries[file].nameBytes), 'cp437').toLowerCase();

      const regex = new RegExp(`^${id.toLowerCase()}\.`, 'm');
      if (filename.match(regex)) {
        const blob = await entries[file].blob();
        const db = await this.db;
        const objectStore = db.transaction(['assets_os'], 'readwrite').objectStore('assets_os');
        const record = {
          asset : blob,
          name : `${type}_${id}`
        };

        const request = objectStore.add(record);

        request.addEventListener('success', () => console.log('Record addition attempt finished'));
        request.addEventListener('error', () => console.error(request.error));

        return blob;
      }
    }

    throw new Error(`${type} asset "${id}" not found!`);
  }
}
