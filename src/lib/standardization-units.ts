import standardizationUnits from '../../units.json';

export type IStandardizationUnits = {
  name: string
  id: string
}

type UnitsMap = {
  [key: string]: IStandardizationUnits;
}

// Definindo o objeto de forma genérica
export default standardizationUnits as UnitsMap