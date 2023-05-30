export const boilerplate = (
  name: string,
  blocks: string,
  interfacesClassesFunctions?: string,
  state?: string,
  enums?: string
) => {
  if (!name && !name.at(0)) throw new Error("Name must be defined");
  return `
/* --- enums --- */
${enums ?? "// none defined"}  

namespace ML_${name.substring(0, 1).toUpperCase() + name.slice(1)} {
  
  /* --- state --- */
  
  ${state ?? "// none defined"}
  
  /* --- interfaces/classes/functions --- */
  ${interfacesClassesFunctions ?? "// none defined"}
  
  /* --- blocks --- */
  ${blocks}
}
`;
};
