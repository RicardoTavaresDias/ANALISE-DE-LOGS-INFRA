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


// Definindo o objeto de forma genérica
// const standardizationUnits: Record<string, IStandardizationUnits> = {
//   vaparecida: { name: "UBS/ESF Vila Aparecida", id: "173" },
//   cgrande: { name: "UBS Campo Grande", id: "154" },
//   jsjorge: { name: "UBS/ESF São Jorge", id: "172" },
//   jscarlos: { name: "UBS/ESF Jardim São Carlos", id: "167" },
//   chacarasto: { name: "UBS Chácara Santo", id: "155" },
//   stoamaro: { name: "UBS Santo Amaro - Dr. Sergio Villaca Braga", id: "160" },
//   miriam1: { name: "AMA/UBS Jardim Miriam I - Manoel Soares de Oliveira", id: "130" },
//   miriam2: { name: "UBS Integral Jardim Miriam II", id: "156" },
//   selma: { name: "UBS/ESF Jardim Selma", id: "168" },
//   niteroi: { name: "UBS/ESF Jardim Niterói", id: "165" },
//   cdjulia: { name: "UBS/ESF Cidade Júlia", id: "163" },
//   bufalos: { name: "UBS Parque dos Búfalos", id: "210" },
//   doroteia: { name: "UBS Parque Dorotéia", id: "159" },
//   pantanal: { name: "UBS/ESF Jardim Novo Pantanal", id: "166" },
//   umuarama: { name: "UBS Jardim Umuarama", id: "158" },
//   missionaria: { name: "AMA/UBS Vila Missionária", id: "133" },
//   mtvirgem: { name: "UBS/ESF Mata Virgem", id: "171" },
//   constancia: { name: "AMA Especialidades Vila Constância - Dr. Vicente Octavio Guida", id: "129" },
//   imperio1: { name: "AMA/UBS Vila Império I", id: "131" },
//   imperio2: { name: "UBS/ESF Vila Império II - Dra. Gilda Tera Tahira", id: "175" },
//   mpaulista: { name: "UBS/ESF Mar Paulista", id: "170" },
//   guacuri: { name: "UBS/ESF Vila Guacuri", id: "174" },
//   laranjeiras: { name: "UBS/ESF Laranjeiras", id: "169" },
//   apura: { name: "UBS/ESF Jardim Apurá", id: "164" },
//   aeroporto: { name: "UBS Jardim Aeroporto - Dr. Massaki Udihara", id: "157" },
//   arriete: { name: "UBS Vila Arriete - Dr. Decio Pcheco Pedroso", id: "161" },
//   upadoroteia: { name: "UPA 24hs Pq. Doroteia", id: "128" },
//   upapedreira: { name: "UPA Pedreira - Dr. Cesar Antunes da Rocha", id: "176" }
// }

/*

export const unitsGlpi = [ 
  //{ id: "000", name: "INTS > REGIAO SACA" },
  { id: "129", name: "AMA Especialidades Vila Constância - Dr. Vicente Octavio Guida" },
  { id: "130", name: "AMA/UBS Jardim Miriam I - Manoel Soares de Oliveira" },
  { id: "131", name: "AMA/UBS Vila Império I" },
  { id: "132", name: "AMA/UBS Vila Joaniza - João Yunes" },
  { id: "133", name: "AMA/UBS Vila Missionária" },
  { id: "134", name: "APD Santo Amaro" },
  { id: "135", name: "CAPS AD II - Cidade Ademar" },
  { id: "136", name: "CAPS Adulto II - Cidade Ademar" },
  { id: "137", name: "CAPS III Adulto Largo 13" },
  { id: "138", name: "CAPS Infanto Juvenil II Cidade Ademar" },
  { id: "139", name: "CAPS Infanto Juvenil II Santo Amaro" },
  { id: "140", name: "CEO ll LRPD - Dr. Humberto Nastari" },
  { id: "141", name: "CER III - Cidade Ademar" },

  //{ id: "000", name: "Comunicação" },
  //{ id: "000", name: "Coordenação" },

  { id: "143", name: "Hospital das Clínicas" },
  { id: "144", name: "Hospital Dia Cidade Ademar" },
  //{ id: "000", name: "Hospital Dia Santo Amaro" },

  { id: "147", name: "Serviço de Assistência Domiciliar - Cidade Ademar" },

  //{ id: "000", name: "SRT  Santo Amaro III" },
  //{ id: "000", name: "SRT Cidade Ademar I" },
  //{ id: "000", name: "SRT Cidade Ademar II" },
  //{ id: "000", name: "SRT Santo Amaro I" },
  //{ id: "000", name: "SRT Santo Amaro II" },

  { id: "154", name: "UBS Campo Grande" },
  { id: "155", name: "UBS Chácara Santo Antônio - Dr. Marcílio de Arruda Penteado" },
  { id: "156", name: "UBS Integral Jardim Miriam II" },
  { id: "157", name: "UBS Jardim Aeroporto - Dr. Massaki Udihara" },
  { id: "158", name: "UBS Jardim Umuarama" },
  { id: "159", name: "UBS Parque Dorotéia" },
  { id: "210", name: "UBS Parque dos Búfalos" },
  { id: "160", name: "UBS Santo Amaro - Dr. Sergio Villaca Braga" },
  { id: "161", name: "UBS Vila Arriete - Dr. Decio Pcheco Pedroso" },
  { id: "162", name: "UBS Vila Constância - Dr. Vicente Octavio Guida" },
  { id: "163", name: "UBS/ESF Cidade Júlia" },
  { id: "164", name: "UBS/ESF Jardim Apurá" },
  { id: "165", name: "UBS/ESF Jardim Niterói" },
  { id: "166", name: "UBS/ESF Jardim Novo Pantanal" },
  { id: "167", name: "UBS/ESF Jardim São Carlos" },
  { id: "168", name: "UBS/ESF Jardim Selma" },
  { id: "169", name: "UBS/ESF Laranjeiras" },
  { id: "170", name: "UBS/ESF Mar Paulista" },
  { id: "171", name: "UBS/ESF Mata Virgem" },
  { id: "172", name: "UBS/ESF São Jorge" },
  { id: "173", name: "UBS/ESF Vila Aparecida" },
  { id: "174", name: "UBS/ESF Vila Guacuri - Cicero Sergio Cavalcante" },
  { id: "175", name: "UBS/ESF Vila Império II - Dra. Gilda Tera Tahira" },
  { id: "128", name: "UPA 24hs Pq. Doroteia" },
  { id: "176", name: "UPA Pedreira - Dr. Cesar Antunes da Rocha" },
  { id: "177", name: "UPA Santo Amaro - Dr. Jose Sylvio de Camargo" },
  { id: "178", name: "URSI - Cidade Ademar" }
]

*/