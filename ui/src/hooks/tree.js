import { fetcher } from '../api/tree';

export async function saveTreeData (treeData) {

  await fetcher(treeData);
}