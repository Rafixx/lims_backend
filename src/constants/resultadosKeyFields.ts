// aquí definiremos para cada una de los modelos RAW que manejamos,
// los campos que se utilizarán en la tabla resultados. Por cada uno de los campos
// que definamos, se acabará generando una fila en la tabla resultados.

export const resultadosKeyFields = {
  NANODROP: [
    {
      valor: 'valor_conc_nucleico',
      unidades: 'valor_uds',
    },
    {
      valor: 'ratio260_280',
      unidades: 'valor_uds',
    },
    {
      valor: 'ratio260_230',
      unidades: 'valor_uds',
    },
  ],

  QUBIT: [
    {
      valor: 'valor',
      unidades: 'valor_uds',
    },
    {
      valor: 'qubit_valor',
      unidades: 'qubit_uds',
    },
  ],
};
