import { readEnv } from '../../config/env.js';
import { MemoryWellnessDataStore, type WellnessDataStore } from './memoryStore.js';
import { PrismaWellnessDataStore } from './prismaStore.js';

let activeDataStore: WellnessDataStore = new MemoryWellnessDataStore();

export function createDataStore(env = readEnv()): WellnessDataStore {
  if (env.nodeEnv === 'test') {
    return new MemoryWellnessDataStore();
  }
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required outside NODE_ENV=test');
  }
  return new PrismaWellnessDataStore();
}

export function setDataStore(store: WellnessDataStore) {
  activeDataStore = store;
}

export function getDataStore() {
  return activeDataStore;
}
