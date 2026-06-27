// global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'duffel-ancillaries': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      ref?: React.RefObject<any>;
    };
  }
}
