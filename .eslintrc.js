module.exports = {
  parser: '@typescript-eslint/parser', // Indica el parser para TypeScript
  parserOptions: {
    ecmaVersion: 2020, // Permite el uso de las últimas características de ECMAScript
    sourceType: 'module', // Permite el uso de import/export
  },
  env: {
    node: true,  // Define variables globales de Node.js
    es6: true,
  },
  extends: [
    'eslint:recommended',              // Reglas recomendadas de ESLint
    'plugin:@typescript-eslint/recommended', // Reglas recomendadas para TypeScript
    'prettier',                        // Desactiva reglas que puedan entrar en conflicto con Prettier
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',  // Muestra errores de formato de Prettier como errores de ESLint
    // Aquí puedes agregar reglas personalizadas según tu preferencia
  },
};
