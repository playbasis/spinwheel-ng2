// the component uses playbasis.js from NPM and has no type definition
// this file mark it as any to suppress blocking typescript compile error

declare module "playbasis.js" {
	var Playbasis: any;
	export default Playbasis;
}