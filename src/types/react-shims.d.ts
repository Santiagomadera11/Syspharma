declare module "react";
declare module "react/jsx-runtime";

declare module "figma:asset/*";

declare global {
  namespace React {
    interface FormEvent<T = any> {
      preventDefault(): void;
      target: any;
    }
    interface ChangeEvent<T = any> {
      target: any;
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
