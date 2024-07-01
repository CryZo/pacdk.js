import { unzip } from "unzipit"
import iconv from 'iconv-lite';
import type { ZipEntry } from "unzipit";
import PacdkHelpers from "./PacdkHelpers";

export default class AssetStorage extends EventTarget {
  private db: Promise<IDBDatabase>;
  private queue: {[type: string]: string[]} = {};
  queueRunning: {[type: string]: boolean} = {};

  constructor() {
    super();

    this.db = new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open('assets_db', 1);
      request.addEventListener('error', () => {
        console.error('Database failed to open');
        reject();
      });
      request.addEventListener('success', () => {
        console.log('Database opened successfully');

        this.fetchAssets();
        resolve(request.result)
      });

      request.addEventListener('upgradeneeded', () => {
        const db = request.result;

        const assets = db.createObjectStore('assets', { keyPath: 'id' });
        assets.createIndex('assetId', 'assetId', { unique: false });
        assets.createIndex('type', 'type', { unique: false });
        assets.createIndex('fileName', 'fileName', { unique: false });

        const zipState = db.createObjectStore('zipState', { keyPath: 'type' });
        zipState.createIndex('state', 'state', { unique: false });

        console.log('Database setup complete');

        this.fetchAssets();
        resolve(request.result)
      });
    });
  }

  public getAsset(id: string, type: string): Promise<string> {
    if (id === '')
      return Promise.reject(`Invalid asset id "${id}" of type "${type}"`);

    id = PacdkHelpers.nameToId(id);

    return new Promise<string>(async (resolve, reject) => {
      const db = await this.db;
      const objectStore = db.transaction('assets').objectStore('assets');
      const request = objectStore.get(`${type}_${id}`);
  
      request.addEventListener('success', async () => {
        try {
          if(request.result) {
            resolve(URL.createObjectURL(request.result.asset));
          }
          else {
            console.log(`Waiting for asset "${id}" of type "${type}"`);
            this.addEventListener(`fetched:${type}_${id}`, async () => {
              resolve(await this.getAsset(id, type));
            });

            if (!this.queue[type]) {
              this.queue[type] = [id];
            }
            else if (!this.queue[type].includes(id)) {
              this.queue[type].push(id);
            }
            else {
              const i = this.queue[type].indexOf(id);
              this.queue[type].unshift(this.queue[type].splice(i, 1)[0]);
            }

            if (!this.queueRunning[type]) {
              await this.fetchByType(type);
            }
          }
        }
        catch (error) {
          reject(error);
        }
      });
    })
  }

  public fetchAssets() {
    return Promise.all([
      this.fetchByType('gfx'),
      this.fetchByType('sfx'),
      this.fetchByType('music')
    ]);
  }

  private async fetchByType(type: string) {
    let zipState = (await this.db).transaction(['zipState'], 'readwrite').objectStore('zipState');
    const state = zipState.get(type);

    await new Promise<void>(resolve => {
      state.addEventListener('success', () => {
        resolve();
      });
    });

    if (state.result && state.result.state === 'fetched')
      return;

    const decodeFilename = (entry: ZipEntry) => iconv.decode(Buffer.from(entry.nameBytes), 'cp437');

    console.debug(`Fetching assets of type "${type}"`);
    this.queueRunning[type] = true;

    const entries = (await unzip(`${import.meta.env.VITE_DATA_URI}/${type}.dat`)).entries;
    const lookupTable: Record<string, string> = {};

    this.queue[type] = Object.keys(entries).map(file => {
      const id = PacdkHelpers.nameToId(decodeFilename(entries[file]).replace(/\.\w+$/m, ''));
      lookupTable[id] = file;

      return id;
    });

    while (this.queue[type].length) {
      const id = this.queue[type].shift()!;
      let filename = '';
      if (lookupTable[id]) 
        filename = lookupTable[id];

      if (!filename) {
        const files = Object.keys(entries);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (PacdkHelpers.nameToId(decodeFilename(entries[file]).replace(/\.\w+$/m, '')) === id) {
            filename = file;
            break;
          }
        }
      }

      if (!filename) {
        console.error(`Asset "${id}" not found in "${type}.dat"`);
        continue;
      }

      const blob = await entries[filename].blob();
      const db = await this.db;
      const objectStore = db.transaction(['assets'], 'readwrite').objectStore('assets');
      const request = objectStore.put({
        asset : blob,
        id : `${type}_${id}`,
        assetId: id,
        type: type,
        fileName: decodeFilename(entries[filename])
      });

      request.addEventListener('success', () => this.dispatchEvent(new CustomEvent(`fetched:${type}_${id}`)));
      request.addEventListener('error', () => console.error(request.error));
    }

    zipState = (await this.db).transaction(['zipState'], 'readwrite').objectStore('zipState');
    zipState.put({type, state: 'fetched'});
    this.queueRunning[type] = false;
  }
}
