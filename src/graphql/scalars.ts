//src/graphql/scalars.ts
import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

function parseAST(ast: ValueNode): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
    case Kind.INT:
    case Kind.FLOAT:
      return ast.value;
    case Kind.OBJECT: {
      const value: Record<string, any> = {};
      ast.fields.forEach((field) => {
        value[field.name.value] = parseAST(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parseAST);
    default:
      return null;
  }
}

export const JSON = new GraphQLScalarType({
  name: 'JSON',
  description: 'Valor JSON arbitrario',
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    return parseAST(ast);
  },
});
