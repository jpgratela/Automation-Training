// Central place for shared test data so credentials/constants aren't
// duplicated across spec files. Mirrors what `npm run seed` creates.

export const ADMIN = {
  username: 'admin@hr.test',
  password: 'Password123',
  fullName: 'HR Admin',
};

/** Build a unique email so repeated runs never collide on the UNIQUE constraint. */
export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}@hr.test`;
}
