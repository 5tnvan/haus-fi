// types/semver.d.ts
declare module "semver/functions/satisfies" {
  function satisfies(version: string, range: string): boolean;
  export default satisfies;
}
