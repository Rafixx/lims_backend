"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = void 0;
const parseDate = (value) => {
    return value ? new Date(value) : undefined;
};
exports.parseDate = parseDate;
