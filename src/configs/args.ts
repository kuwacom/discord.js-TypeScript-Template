const args = process.argv.slice(2);
export const isDev = args.includes('--dev');
export const isProd = !isDev;

export default args;
