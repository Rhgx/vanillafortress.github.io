// typescript does not understand what the fuck a "YAML" is
// all my homies HATE ts

declare module "*.yaml" {
  const value: any;
  export default value;
}