export interface Node {
  id: string;
  componentName: string;
  children: string[];
  parents: string[];
  relationships: { [key: string]: string };
  runsOn: {
    runsOnParents: string[];
    runsOnChildren: string[];
  };
}