import { reactive } from "../reactivity/reactive";
export const extend = Object.assign;

export const isObject = (val: any) => {
  return val !== null && typeof val === "object";
};

export const isString = (val: any) => typeof val === "string";

export const hasChanged = (val: any, newVal: any) => {
  return !Object.is(val, newVal);
};

export const convert = (newValue: any) => {
  return isObject(newValue) ? reactive(newValue) : newValue;
};
export const isOn = (event: string) => {
  return /^on[A-Z]/.test(event);
};

export const hasOwn = (properties, key) => {
  return Object.prototype.hasOwnProperty.call(properties, key);
};
// TPP 先写一个特定的行为 再重构成一个通用的行为
// add => Add
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
export const toHandleKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
// add-foo => addFoo
export const cameLize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
