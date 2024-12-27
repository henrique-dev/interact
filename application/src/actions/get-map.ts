'use server';

import fs from 'fs';

export const getMap = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const file = fs.readFileSync('src/maps/house.json', 'utf8');
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
};
