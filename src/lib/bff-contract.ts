import contract from '../../contracts/openapi.json';

// Lecture du contrat BFF_Calendar synchronisé (contracts/openapi.json), partagée par le proxy et le middleware.
// Seules les opérations déclarées ici sont joignables depuis le navigateur.

type Operation = { requestBody?: { content?: Record<string, unknown> } };
type PathItem = Record<string, Operation>;

export type ContractRoute = { template: string; operations: PathItem };

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

// Les chemins littéraux priment sur les chemins paramétrés (`/a/b` avant `/a/{id}`).
const routes: Array<ContractRoute & { segments: string[] }> = Object.entries(contract.paths as unknown as Record<string, PathItem>)
  .map(([template, operations]) => ({ template, operations, segments: template.split('/').filter(Boolean) }))
  .sort((a, b) => a.segments.filter(isParameter).length - b.segments.filter(isParameter).length);

function isParameter(segment: string) {
  return /^\{[^}]+\}$/.test(segment);
}

export function findContractRoute(path: string[]): ContractRoute | undefined {
  return routes.find(({ segments }) =>
    segments.length === path.length && segments.every((segment, index) => isParameter(segment) || segment === path[index]));
}

export function isContractDataPath(pathname: string) {
  return findContractRoute(pathname.split('/').filter(Boolean)) !== undefined;
}

/** Méthodes déclarées pour la route, en majuscules ; HEAD est implicite dès que GET est déclaré. */
export function allowedMethods(route: ContractRoute) {
  const methods = Object.keys(route.operations).filter((method) => HTTP_METHODS.includes(method)).map((method) => method.toUpperCase());
  if (methods.includes('GET') && !methods.includes('HEAD')) methods.push('HEAD');
  return methods;
}

/** Types de contenu acceptés pour le corps de l'opération ; vide si le contrat ne déclare aucun corps. */
export function requestBodyMediaTypes(route: ContractRoute, method: string) {
  return Object.keys(route.operations[method.toLowerCase()]?.requestBody?.content ?? {});
}
